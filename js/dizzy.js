/*
 * dizzy.js 
 * http://dizzy.metafnord.org
 * 
 * Version: 0.4.0
 * Date: 04/05/2011
 * 
 * licensed under the terms of the MIT License
 * http://www.opensource.org/licenses/mit-license.html
 */

var Dizzy =	(function(window, document, undefined){
	
	// constructor
	function Dizz(selector, presentationOptions){
		// if Dizz is called without new, just return it yourself.
		if( this === window ){
			return new Dizz(selector, presentationOptions);
		}
		//"use strict"; // strict mode, see: https://developer.mozilla.org/en/JavaScript/Strict_mode
		var that = this;
		
		// default values for variables..
		// container element from html
		var container = selector; 
		// svg-element from loaded svg-file
		that.svg = undefined;
		// group that is used for transformations, child of svg
		that.canvas = undefined;
		// group that is now shown
		var groupNum = -1;
		
		that.options = {
			// time the animated transformation takes (in ms)
			transformTime : 1000,
			// determines how much zooming is made on zoom() call. 1 = none, 2 = double/halve zoomfactor, etc..
			zoomFactor : 2,
			// determines if canvas is pannable
			pannable : true,
			// determines if canvas is zoomable
			zoomable : true,
			// if true, a click on a group will transform to that group
			clickNavigation  : false
		};
		// overwrite default options
		var opt;
		for( opt in presentationOptions ){
			// using that.options instead of this.options for consistency
			if( typeof presentationOptions[opt] !== 'function' && typeof that.options[opt] !== 'undefined' ){
				that.options[opt] = presentationOptions[opt];
			}
		}
		
		
		/*
		 * -------------------
		 * Private functions
		 * -------------------
		 */
		 
		 /**
		  * Adds the default event handlers (zooming, panning, onclick-navigation).
		  * Which handler will be appended depends on the options passed with the constructor.
		  */
		var addDefaultEventHandlers = function(){
			if( that.options.clickNavigation === true ){
				$('.group', that.svg.root() ).bind('click', function(ev){
					var group = ev.currentTarget;
					// private method calling public method -> that.
					var groupMatrix = that.getTransformationMatrix(group);
					transformCanvas(groupMatrix.inverse());
					return false;
				});
			}
			var doc = $(document);
			if( that.options.zoomable === true ){
				doc.mousewheel(function(e, delta){ // mousewheel support for scrolling in canvas
					that.zoom(delta, e);
				});
			}
			if( that.options.pannable === true ){
				$(that.svg.root()).mousedown( function(e){ return panningStart(e); } );
			}
		};
		
		
		
		/*
		 * ---------------------------------------------------
		 * Public functions (don't use this for member access)
		 * ---------------------------------------------------
		 */
		/**
		 * Loads a remote SVG file to the container element.
		 * @param {String} url URL of file to load
		 * @param {function} callback Function to execute after 
		 */
		Dizz.prototype.load = function(url, callback){  
			container = $(container);
			container
				.empty()
				.removeClass('hasSVG')
				.svg({
					loadURL: url, 
					onLoad: (function(svgw){
						that.svg = container.svg('get');
						that.canvas = $('#canvas', that.svg.root() );
						
						// zebra is for the editor only, hide at first.
						$('#zebra', that.svg.root()).hide();
						// adds transform attribute if there is none
						that.canvas.attr('transform', 'rotate(0)');
						
						addDefaultEventHandlers();

						if( typeof callback !== 'undefined' ){
							callback();
						}
						$(that.svg).trigger('ready.dizzy');
					})
			});
			return this;
		}; 
		
		
		
		/**
		 * Checks if there is a group defined with the given number
		 * @param number The number of the group to look up.
		 */
		Dizz.prototype.hasGroup = function(number){
			// jQuery function $ returns array with elements matching given selector
			return that.getGroup(number).size() > 0;
		};
		
		/**
		 * Returns all groups (should really only return 1 element) 
		 * with the given number from the canvas.
		 * @param number Number of the group to fetch
		 */
		Dizz.prototype.getGroup = function(number){
			/* 
			 * maybe some better day I will be able to select like this:
			 * g[dizzy:number~= 42]
			 * see: http://www.w3.org/TR/SVG/extend.html#PrivateElementsAndAttribute
			 * browser support: meh.
			 */
			return $('g.group_'+number, that.svg.root());
		};
		
		/**
		 * Just returns the internal counter
		 * @return {Integer} Number of the group that is in focus now.
		 */
		Dizz.prototype.getShownGroupNumber = function(){
			return parseInt(groupNum, 10);
		};
		
		/**
		 * Checks internal counter against element-classes in svg, 
		 * only raises counter if there is at least one element with class '.group'+(counter+1)
		 * @return {Integer} number of now shown group
		 */
		Dizz.prototype.next = function(){
			var nextSlide = parseInt(groupNum, 10)+1;	
			return that.show(nextSlide);
		};
		
		/**
		 * Checks internal counter against 0, 
		 * only decreases counter if it is above 0
		 * @return {Integer} number of now shown group
		 */
		Dizz.prototype.previous =  function(){
			return that.show(groupNum-1);
		};
		/**
		 * shows the group with the given number
		 * used by next() and previous().
		 * @param number number of the group to show now or the canvas (0 = canvas, 1..n = group number).
		 * @return {Integer} number of now shown group (basically the input parameter)
		 */
		Dizz.prototype.show =  function(number){
		
			if( number >= 0 && (that.hasGroup(number)||number===0) ){
				groupNum = number;
				updateDisplay();
			}
		
			return number;
		};
		
		/**
		 * Returns the transformationmatrix of the given element.
		 * Does include all transformations from parent-groups (excluding g#canvas).
		 * @param {DOMElement} node
		 * @return {SVGMatrix} consolidated matrix of the node multiplied with the 
		 * matrices of all parent g.group's up to the canvas group (excluding)
		 */
		Dizz.prototype.getTransformationMatrix = function(node){
			var activeGroupTransformBase = node.transform.baseVal; // TODO multiple nodes with that class? shouldn't happen, but it will...
			
			if( activeGroupTransformBase.numberOfItems === 0 ){
				 var newTransform = that.svg.root().createSVGTransform();
				 activeGroupTransformBase.appendItem(newTransform);
			}
			var activeGroupTransformMatrix =  activeGroupTransformBase.consolidate().matrix;
			// subgroups have to be "de-transformed" with the transformations of their parents
			var parentGroups = $(node).parentsUntil('g#canvas, svg');
			
			/* 
			 * iterate over parents in the DOM until you hit the #canvas-group
			 * multiply parent transformation matrix to undo all of them too..
			 */
			parentGroups.each(	function(index){
									var parent = $(this);
									var parentBase = parent[0].transform;
									if( typeof parentBase !== 'undefined' ){
										parentBase = parentBase.baseVal;
									}
									if( parentBase.numberOfItems === 0 ){
										var newTransform = that.svg.root().createSVGTransform();
										parentBase.appendItem(newTransform);
									}
									var parentMatrix = parentBase.consolidate().matrix;
									// careful with the order of operands on the multiplication
									// matrix multiplications are not commutative!
									activeGroupTransformMatrix = parentMatrix.multiply(activeGroupTransformMatrix);
									
								});
			
			return activeGroupTransformMatrix;
		};
		
		
		/**
		 * Does an animated transform on the canvas. Used for focusing a transformed group.
		 * @param {SVGMatrix} matrix The SVGMatrix that's gonna be used for the transform.
		 * @param transformDuration a number indicating the length of the animation in ms.
		 */
		var transformCanvas = function(matrix, transformDuration){
			var m = matrix;
			if( typeof transformDuration === 'undefined'){
				transformDuration = that.options.transformTime;
			}
			$(that.canvas).animate({svgTransform:  'matrix('+m.a+' '+m.b+' '+m.c+' '+m.d+' '+m.e+' '+m.f+')'}, transformDuration);
			
			$(that.canvas).trigger('transformed');
		};
		
		
		

		/**
		 * Gets the group that should be displayed and undoes the transformations that have been applied to it.
		 * This is done by fetching the Transformationmatrix of the group, inverse it and apply it to the _canvas group_ 
		 * (results in a visual transform of the whole image)
		 */
		var updateDisplay =  function(){
			if( groupNum >= 0 ){
				
				var activeGroup;
		
				// get active group or canvas (overview)
				if( groupNum === 0 ){
					activeGroup = $('#canvas');
					// return canvas to "normal" state
					$(that.canvas).animate({svgTransform:  'matrix(1 0 0 1 0 0)'}, that.options.transformTime);
				}else{
					activeGroup = that.getGroup(groupNum);
		
					if( activeGroup.length > 0 ){
						// get transformationmatrix (SVGMatrix class)
						var activeGroupTransformMatrix = that.getTransformationMatrix(activeGroup[0]);
		
						// multiply inverse transformation matrix on canvas (should reverse active transformation)
						var newMatrix = activeGroupTransformMatrix.inverse();
						transformCanvas(newMatrix);
					}
				}
				
			}	
		};
		
		/**
		 * Zooms in/out one unit, based on the given argument. 
		 * @param zoomInOut -1 for zooming out one unit, +1 for zooming in
		 */
		Dizz.prototype.zoom = function(zoomInOut, e){
			if( that.options.zoomable === true ){
				
				//because I am to tired to think of a nice mathematical way to do this now.. this has to do..
				if( zoomInOut > 0 ){
					zoomInOut =that.options.zoomFactor;
				}else{
					zoomInOut = 1/that.options.zoomFactor;
				}
							
				var newMatrix = $(that.canvas, that.svg.root())[0].transform.baseVal.consolidate().matrix;
				
				// if mouse event is passed, scale with the mouseposition as center (roughly)
				//translate( -centerX*(factor-1), -centerY*(factor-1))
				if( typeof e !== 'undefined' ){
					var mousePoint = this.transformCoordinates(e.pageX, e.pageY);
					newMatrix = newMatrix.translate(-mousePoint.x*(zoomInOut-1), -mousePoint.y*(zoomInOut-1));
				}
				
				newMatrix = newMatrix.scale(zoomInOut);
		
				transformCanvas(newMatrix);
			}
		};
		
		
		
		/**
		 * Converts X/Y values from the mouseevent to SVG-coordinates. 
		 * Necessary because SVG can use a relative coordinate space and rotation/scaling.
		 * @param x X-Value in pixel (usually event.pageX)
		 * @param y Y-Value in pixel (usually event.pageY)
		 * @param node optional. Uses the transformation of the group to transform the xy-coordinates.
		 * @param ignoreCanvas optional. Indicates if the current transform on the canvas should be ignored. default is false.
		 */
		// was convertAbsoluteToRelative(x,y,node)
		Dizz.prototype.transformCoordinates = function(x, y, node, ignoreCanvas){
			if( typeof node === 'undefined' ){
				node = $(that.canvas);
			}
			if( typeof ignoreCanvas === 'undefined' ){
				ignoreCanvas = false;
			}
		
			var svgPoint = that.svg.root().createSVGPoint();
			svgPoint.x = x;
			svgPoint.y = y;
			if( typeof node[0].transform !== 'undefined' && 
				typeof node[0].transform.baseVal.consolidate() !== 'undefined' ){
				
				var canvasMatrix = node[0].transform.baseVal.consolidate().matrix;
				if( ignoreCanvas === true ){
					var m2 = $(that.canvas)[0].transform.baseVal.consolidate().matrix;
					canvasMatrix = m2.multiply(canvasMatrix);
				}
				
				svgPoint = svgPoint.matrixTransform(canvasMatrix.inverse());
			}
			return svgPoint;
		};
		
		
		
		
		
		
		
		
		var panningInfo = {};
		/**
		 * starts the panning, saves current mouseposition
		 */
		var panningStart = function(ev){
			// prevents that ugly default-dragging of svg elements :>
			ev.preventDefault();
			
			var svgPoint = that.transformCoordinates(ev.pageX, ev.pageY);
			
			panningInfo.x = svgPoint.x;
			panningInfo.y = svgPoint.y;
			
			
			var endpan = function(e){ return panningEnd(e); };
			var doc = $(document);
			doc.
				bind( 'mousemove.dizzy.panning', function(e){ return panning(e); } ).
				bind( 'mouseup.dizzy.panning', endpan ).
				// mouseout would fire if the mouse gets dragged over an descendant, mouseleave does not
				bind( 'mouseleave.dizzy.panning', endpan ); 
			$(that.canvas).trigger('transformed');
	
			return false;
		};
		
		/**
		 * Pans the canvas by the offset from pan/ev.pageXY. Usually called as mousemoved()
		 */
		var panning = function(ev){
			
			var canvasMatrix = $(that.canvas)[0].transform.baseVal.consolidate().matrix; // [0] undefined
			
			// convert delta values (because SVG works with relative dimensions + rotation + scale)
			var svgPoint = that.transformCoordinates(ev.pageX, ev.pageY);
			var moveMe = {};
			moveMe.x = svgPoint.x - panningInfo.x;
			moveMe.y = svgPoint.y -panningInfo.y;
		
			canvasMatrix = $(that.canvas)[0].transform.baseVal.consolidate().matrix;
			canvasMatrix = canvasMatrix.translate( moveMe.x, moveMe.y);
			var newMatrix = canvasMatrix;
			$(that.canvas).attr('transform','matrix('+newMatrix.a+' '+newMatrix.b+' '+newMatrix.c+' '+newMatrix.d+' '+newMatrix.e+' '+newMatrix.f+')');
		
			svgPoint = that.transformCoordinates(ev.pageX, ev.pageY);
			panningInfo.x = svgPoint.x;
			panningInfo.y = svgPoint.y;
	
			return false;
		};
		/**
		 * Ends the panning, usually called as mouseup()
		 */
		var panningEnd = function(ev){
			ev.stopPropagation();
			var doc = $(document);
			doc.
				unbind('mousemove.dizzy.panning');
		
			return false;
		};
		
		
		
		
		
		
	};
	
	return Dizz;
})(window, document);






// Did you see that dolphin's face? He was like, "Wait. Was that Vladimir fucking Putin? With a fucking crossbow?"
