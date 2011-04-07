/*
 * dizzy.editor.js 
 * http://dizzy.metafnord.org
 * 
 * Version: 0.3.0
 * Date: 02/07/2011
 * 
 * licensed under the terms of the MIT License
 * http://www.opensource.org/licenses/mit-license.html
 */
Dizzy =	(function(D, window, document, undefined){
	
	/**
	 * Constructs a new Editor-Object, with all options from the parent.
	 */
	function DizzyEditorWrapper(selector, options){
		DizzyEditor.prototype = new D(selector, options);
		return new DizzyEditor();
	}
	
	/**
	 * 
	 * @return 
	 * @type 
	 */
	function DizzyEditor(){
		var dizzyOptionsBackup = undefined;
		var selectedGroup;
		var selectedTarget;
		var that = this;
		var isEditorMode = false;
		/**
		 * Toggles the editor-mode on the current SVG.
		 * @param {boolean} enable true to turn editor-mode on, false to turn it off.
		 */
		DizzyEditor.prototype.editor = function(enable){
         isEditorMode = enable;
			if( enable === true ){
            
				// backup old values
				if(dizzyOptionsBackup === undefined){
					dizzyOptionsBackup = { 
						pannable : that.options.pannable, 
						zoomable : that.options.zoomable, 
						transformTime : that.options.transformTime 
					};
				}
				// for editing, use other values
				that.options.pannable = true;
				that.options.zoomable = true;
				that.options.transformTime = 100;
				
				// rewrite viewbox. Not the nicest thing to do, but makes so many things so much easier.
				that.svg.configure({viewBox: '0 0 '+$(document).width()+' '+$(document).height() }, true);	
				
				that.editorModes = [ DizzyEditor.prototype.editorDefaultMode,  DizzyEditor.prototype.editorPathMode ];
	
				// add zebra
				loadZebra();
				
				// add eventhandlers
				that.editorDefaultMode(true);
			}else{
				that.options.pannable = dizzyOptionsBackup.pannable;
				that.options.zoomable = dizzyOptionsBackup.zoomable;
				that.options.transformTime = dizzyOptionsBackup.transformTime;
				

				
				// hide zebra
				hideZebra();
				
				that.editorDefaultMode(false);
				that.editorPathMode(false);
			}
		};
      
      DizzyEditor.prototype.isEditing = function(){
         return isEditorMode;
      };
		
		DizzyEditor.prototype.lowerLayer = function(){
         var node = selectedGroup;
         node.insertBefore(node.prev('g.group'));
      };
      DizzyEditor.prototype.raiseLayer = function(){
         var node = selectedGroup;
         node.insertAfter(node.next('g.group'));
      };
      
		/*
		 * ----------------------
		 * Private methods
		 * ----------------------
		 */
		/** 
		 * Sets the default mode (free navigation on canvas, clicking groups opens zebra).
		 * @param {boolean} enable or disable this mode.
		 */
		DizzyEditor.prototype.editorDefaultMode = function(enable){
			if( enable === true ){
				// disable all other modes
				$(that.editorModes).each( function(index){ this(false); } );
				
				$('g.group > *', that.svg.root() ).live('click.dizzy.editor.default', function(event){ return showZebra(event); } );
				// not so nice to bind it to document.. but otherwise keypresses won't fire somehow o_O
				$(document).bind('keypress.dizzy.editor', function(event){ return keyPressed(event); });
				$(document).bind('keydown.dizzy.editor',  function(event){ return keyDown(event); });
				$(that.canvas).bind('transformed', function(event){ hideZebra(event); } );
				// allow images to be dragged on the canvas. (:
				// I love this feature, although not supported in Opera ):
				if (window.File && window.FileReader && window.FileList) {
					$(that.svg.root()).bind('dragover.dizzy.editor', function(evt){ evt.stopPropagation(); evt.preventDefault(); } );
					$(that.svg.root()).bind('drop.dizzy.editor', function(evt){ fileDropped(evt); } );
				}
			}else{
				$('g.group > *', that.svg.root() ).die('click.dizzy.editor.default');
				$(document).unbind('keypress.dizzy.editor');
				$(document).unbind('keydown.dizzy.editor');
		
				$(that.svg.root()).unbind( 'dragover.dizzy.editor' );
				$(that.svg.root()).unbind( 'drop.dizzy.editor' );
			}
		};
		
		/**
		 * Toggles to path mode (free navigation on canvas, clicking groups adds them to the path).
		 * Also sets the button in the toolbar to disabled.
		 * @param {boolean} enable enable or disable this mode
		 */
		DizzyEditor.prototype.editorPathMode = function(enable){
			if( enable === true ){
				// disable all other modes
				$(that.editorModes).each( function(index){ this(false); } );
				if( typeof this.pathNumber === 'undefined' ){
					this.pathNumber = 0;
				}
				
				var os = this;
				$('g.pathNumberIndicator', that.svg.root() ).show();
				
				
				var allGroups = $('g.group', that.svg.root() ).children();
				allGroups.unbind('click.dizzy.editor.path');
				allGroups.bind('click.dizzy.editor.path', function(e){ ++os.pathNumber; addPath($(e.currentTarget), os.pathNumber); } );
				
				$('g.pathNumberIndicator', that.svg.root() ).bind('mousedown.dizzy.editor.path.move', function(event){ return pathNumberDragStart(event); } );
				
			}else{
				// remove visible pathnumbers again
				$('g.pathNumberIndicator', that.svg.root() ).hide();
				$('g.pathNumberIndicator', that.svg.root() ).die('mousedown.dizzy.editor.path.move');
				$('g.group', that.svg.root() ).children().unbind('click.dizzy.editor.path');
			}
		};
		
		/**
		 * Used to get the XML-Representation of the SVG-DOM.
		 */
		DizzyEditor.prototype.serialize = function(){
		 	// Fixes Chrome. I really have no clue why chrome leaves that out otherwise...
			$(that.svg.root()).attr('xmlns','http://www.w3.org/2000/svg');
			hideZebra();
			// clean up, remove all empty groups
			$('.group:empty', that.svg.root()).remove();
			
			return that.svg.toSVG();	
		}; 
		
		/**
		 * Adds a group number to a node. Used for making navigation paths through the groups.
		 * @param {DOMElement} node A group that will be the next in the path.
		 * @param num the current groupnumber.
		 */
		var addPath = function(node, num){
			var group = node;
			if( !group.is('g.group') ){
				group = $(node).parent('g.group').first();
			}
			var pathCount = group.data('pathCount');
			if( typeof pathCount === 'undefined' ){
				pathCount = 0;
			}
			var pathX = $(document).width()/2.4 + (31*pathCount) ;
			var pathY = $(document).height()/2.4;
			
			group.addClass('group_'+num);
			
			var pathNode = $(that.svg.other(group, 'g'));
			pathNode.attr('class','pathNumberIndicator');

			var pathCircle = $(that.svg.circle(group, 0, 0, 15));
			pathCircle.attr('fill', '#006000')
			
			var pathText = $(that.svg.other(group, 'text'));
			pathText.attr('text-anchor', 'middle')
				.attr('font-size', '20')
				.attr('font-weight', 'bold')
				.attr('y', '5')
				.attr('x', '0')
				.attr('fill','#FFFFFF');
	
	
			pathText.text(num);
			
			pathNode.append(pathCircle);
			pathNode.append(pathText);
			
			pathNode.attr('transform', 'translate('+pathX+' '+pathY+')');
			pathNode.data('number', num);
			
			group.append(pathNode);
			group.data('pathCount', parseInt(pathCount,10)+1);
			
			$('g.pathNumberIndicator', that.svg.root() ).bind('mousedown.dizzy.editor.path.move', function(event){ return pathNumberDragStart(event); } );
		};
		
		
		var removePath = function(node, num){
			var group = node;
			if( !group.is('g.group') ){
				group = $(node).parent('g.group').first();
			}
			var pathCount = group.data('pathCount');
			group.data('pathCount', pathCount-1);
			group.removeClass('group_'+num);
			
			var pathX = $(document).width()/2.4;
			var pathY = $(document).height()/2.4;
			
			group.children('g.pathNumberIndicator').each(
				function(index){
					var numNode = $(this);
					numNode.attr('transform', 'translate('+pathX+' '+pathY+')');
					pathX += 31;
				}
			);
		};
		
		var pathNumberDragOptions = {};
		var pathNumberDragStart = function(event){
			event.stopImmediatePropagation();
			
			var pathGroup = $(event.currentTarget);
			
			pathGroup.css('opacity','0.8');
			
			pathNumberDragOptions.group = pathGroup;
			pathNumberDragOptions.from = pathGroup.parent();
			pathNumberDragOptions.to = pathGroup.parent();
			
			pathGroup.detach();
			$(that.svg.root()).append(pathGroup);
			
			$(document).bind('mousemove.dizzy.editor.path.move', function(e){ return pathNumberDrag(e); } );
			$('g.group').bind('mouseenter.dizzy.editor.path.move.group', function(e){ return pathNumberDrop(e); } );
			$(document).bind('mouseup.dizzy.editor.path.move', function(e){ return pathNumberDragEnd(e); } );
			
			return false;
		};
		
		
		var pathNumberDrag = function(event){
			var group = pathNumberDragOptions.group;
			group.attr('transform', 'translate('+(event.pageX+20)+' '+(event.pageY+20)+')');
			
		
			return true;
		};
		
		var pathNumberDragEnd = function(event){
			event.stopImmediatePropagation();
			var group = pathNumberDragOptions.group;
			group.detach();
			
						
			$(document).unbind('mousemove.dizzy.editor.path.move' );
			$('g.group', that.svg.root() ).unbind('mouseenter.dizzy.editor.path.move.group' );
			$(document).unbind('mouseup.dizzy.editor.path.move' );
			
			var pathNumber = group.data('number');
			var fromNode = pathNumberDragOptions.from;
			var toNode = pathNumberDragOptions.to;
			
			removePath(fromNode, pathNumber);
			addPath(toNode, pathNumber );
			group.remove();
			
			return false;
		};
		
		var pathNumberDrop = function(event){
			var group = $(event.currentTarget);

			pathNumberDragOptions.to = group;
			// *
			group.bind('mouseleave.dizzy.editor.path.move.group', 
				function(e){ 
					pathNumberDragOptions.to  = pathNumberDragOptions.from; 
					group.unbind('mouseleave.dizzy.editor.path.move.group');
					
				});
			// */
			return true;
		};

		
		/**
		 * Loads the zebra-element in the SVG if not already present.
		 * TODO: load dynamicly if not present.
		 */
		var loadZebra = function(){
			// just a dummy since I stripped the zebra from the svg (:
		};
		/**
		 * Removes Zebra from SVG.
		 */
		var removeZebra = function(){
			// just a dummy since I stripped the zebra from the svg (:
		};
		
		
		
		/*
		 * ---------------------
		 * Zebra handlers
		 * ---------------------
		 */
		var zebraScaleInfo = {};
		/**
		 * Starts scaling. Called on mousedown on the inner ring of the zebra.
		 */
		var zebraScaleStart = function(event){
			var zebra = $('#zebra');
			var groupMatrix = that.getTransformationMatrix(selectedGroup[0]);
			zebraScaleInfo = { matrix: groupMatrix, xa: parseFloat(zebra.css('left'))+75, ya: parseFloat(zebra.css('top'))+75 };
			
			$( document ).bind('mousemove.dizzy.editor.scale', function(ev){ return zebraScale(ev); } );
			var end = function(ev){ return zebraScaleEnd(ev); };
			$( document ).bind( 'mouseup.dizzy.editor', end );
			//$( that.svg.root() ).mouseout( end );
		
			return false;
		};
		
		var zebraScale = function(event){
			var svgPoint = { x: event.pageX, y: event.pageY};
			
			var cVector = { x: zebraScaleInfo.xa - svgPoint.x, y: zebraScaleInfo.ya - svgPoint.y };
			var cVectorLength = Math.sqrt( cVector.x*cVector.x +  cVector.y*cVector.y ) / 40; // 40 is about the radius of the scale circle
		
			var groupMatrix = that.getTransformationMatrix(selectedGroup[0]);
			
			
			var newMatrix = zebraScaleInfo.matrix	// translation is used to scale group around center
														.translate(-$(document).width()/2*(cVectorLength-1),-$(document).height()/2*(cVectorLength-1))
														.scale(cVectorLength);
			
			selectedGroup.attr('transform', 'matrix('+newMatrix.a+' '+newMatrix.b+' '+newMatrix.c+' '+newMatrix.d+' '+newMatrix.e+' '+newMatrix.f+')');
			
			return false;
		};
		
		var zebraScaleEnd = function(event){
			$( document ).unbind('mousemove.dizzy.editor.scale');
			$( document ).unbind( 'mouseup.dizzy.editor');
	
			return false;
		};
	
	
	
	
		var zebraTranslateInfo = {};	
		var zebraTranslateStart = function(event){
			var groupMatrix = that.getTransformationMatrix(selectedGroup[0]);
			
			var svgPoint = that.transformCoordinates(event.pageX,event.pageY, selectedGroup, true, true);
			
			zebraTranslateInfo = { x: svgPoint.x, y: svgPoint.y, matrix: groupMatrix };
			
			$( document ).bind('mousemove.dizzy.editor.zebra.translate', function(ev){ return zebraTranslate(ev); } );
			var zebraTranslateEndFunction = function(ev){ return zebraTranslateEnd(ev); };
			$( document ).bind( 'mouseup.dizzy.editor.zebra.translate', zebraTranslateEndFunction );
			return false;
		};
		
		var zebraTranslate = function(event){
			
			// convert delta values (because SVG works with relative dimensions + rotation + scale)
			var svgPoint = that.transformCoordinates(event.pageX,event.pageY, selectedGroup, true, true);
			var moveMe = {};
			moveMe.x = svgPoint.x - zebraTranslateInfo.x;
			moveMe.y = svgPoint.y - zebraTranslateInfo.y;
			
			
			var newMatrix = zebraTranslateInfo.matrix.translate(moveMe.x, moveMe.y);
			selectedGroup.attr('transform', 'matrix('+newMatrix.a+' '+newMatrix.b+' '+newMatrix.c+' '+newMatrix.d+' '+newMatrix.e+' '+newMatrix.f+')');
			zebraTranslateInfo.matrix = newMatrix;
			
			var zebra = $('#zebra');
			var coords = that.transformCoordinates(event.pageX,event.pageY, $(that.svg.root()), true);
			zebra.css('left', coords.x-75);
			zebra.css('top', coords.y-75);
			
			return false;
		};
		
		var zebraTranslateEnd = function(event){
			$( document ).unbind('mousemove.dizzy.editor.zebra.translate');
			$( document ).unbind('mouseup.dizzy.editor.zebra.translate');
			return false;
		};
			
	
	
	
		var zebraRotateInfo = {};
		var zebraRotateStart = function(event){
			var zebra = $('#zebra');
			var groupMatrix = that.getTransformationMatrix(selectedGroup[0]);
			var x1 = parseFloat(zebra.css('left'))+75;
			var y1 = parseFloat(zebra.css('top'))+75;
			zebraRotateInfo = { 
						xa: x1,
						ya: y1,
						lastVector: {
							x: event.pageX - x1,
							y: event.pageY - y1
						},
						matrix: groupMatrix
			};
			
			$( document ).bind('mousemove.dizzy.editor.rotate', function(ev){ return zebraRotate(ev); } );
			
	
			var end = function(ev){ return zebraRotateEnd(ev); };
			$( document ).bind('mouseup.dizzy.editor.rotate', end );
		
			return false;
		};
		
		var zebraRotate = function(event){
			var zebra = $('#zebra');
			
			var newVector = {
				x: event.pageX - zebraRotateInfo.xa,
				y: event.pageY - zebraRotateInfo.ya
			};
			var lastVector = zebraRotateInfo.lastVector;
		
			var angle =  180/Math.PI * (Math.atan2(newVector.y,newVector.x) - Math.atan2(lastVector.y,lastVector.x));
		
			var xTranslate = $(document).width()/2;
			var yTranslate = $(document).height()/2;
			// rotate around group center
			var newMatrix = zebraRotateInfo.matrix.
										translate(xTranslate, yTranslate).
										rotate(angle).
										translate(-xTranslate, -yTranslate);
		
         var vendorprefixes = ['','-o-', '-webkit-', '-moz-', '-ms-'];
         for( var i = 0; i < vendorprefixes.length; ++i ){
            $( '#zebra-rotate').css(vendorprefixes[i]+'transform', 'rotate('+angle+'deg)');
         }
      
			selectedGroup.attr('transform', 'matrix('+newMatrix.a+' '+newMatrix.b+' '+newMatrix.c+' '+newMatrix.d+' '+newMatrix.e+' '+newMatrix.f+')');
			
			return false;
		};
		
		var zebraRotateEnd = function(event){
			$( document ).unbind('mousemove.dizzy.editor.rotate');
			$( document ).unbind('mouseup.dizzy.editor.rotate');
			return false;
		};
		
		// TODO bind transformed event handler to hide the zebra again
	
	
	
		var showZebra = function(ev){
         var svgRoot = that.svg.root();
			var zebra = $( '#zebra' );
			zebra.css('opacity', '0.9');
			$( '#zebra  #zebra-rotate').mousedown( function(ev){ return zebraRotateStart(ev); } );
			$( '#zebra #zebra-scale').mousedown( function(ev){ return zebraScaleStart(ev); } );
			$( '#zebra #zebra-translate').mousedown( function(ev){ return zebraTranslateStart(ev); } );
			
			var group = $( ev.currentTarget.parentNode, svgRoot );
			
			// zoom in on element, disabled for now.
			 var groupMatrix = that.getTransformationMatrix(group[0]);
			// that.transformCanvas(groupMatrix.inverse());
			
			selectedGroup = group;
			selectedTarget = $(ev.currentTarget, svgRoot);
			
			// mark group
			group.css('opacity', '0.6');
		
			// display zebra at the mouse position
			zebra.css('left',ev.pageX-75);
			zebra.css('top',ev.pageY-75);
			zebra.show();
			
			$('svg, #canvas', svgRoot).bind('mousedown.dizzy.editor.hidezebra', function(ev){ hideZebra(ev); } );
			
			return false;
		};
		
		var hideZebra = function(ev){
			$( '#zebra' ).css('opacity', '');
			$( '#zebra' ).hide();
			
			if( typeof selectedGroup !== 'undefined' ){
				selectedGroup.css('opacity', '1');
			}
			selectedGroup = undefined;
			selectedTarget = undefined;
			return true;
		};
	   DizzyEditor.prototype.hideZebra = hideZebra;
      
		
			
		/**
		 * Keypressed handles all text input.
		 */
		var keyPressed = function(ev){
			ev.preventDefault();
			var node = selectedTarget;
			
			if( typeof node === 'undefined' ){ // new text node
				
				var group = $(that.svg.other($('#canvas'), 'g'));
				group.attr('class','group');
				var matrix = that.getTransformationMatrix(that.canvas[0]).inverse();
				group.attr('transform', 'matrix('+matrix.a+' '+matrix.b+' '+matrix.c+' '+matrix.d+' '+matrix.e+' '+matrix.f+')');
				var text = $(that.svg.other(group, 'text'));
				var textSpan = $(that.svg.other(selectedTarget, 'tspan'));
				text.attr('y', '50%');
				textSpan.attr('x', '50%');
				
				text.append(textSpan);
				group.append(text);
	
				selectedGroup = group;
				selectedTarget = text;
				node = text;
			}
			node = node.children().last();
			var oldText = node.text();
			if( ev.which !== 8 ){ // backspace
				node.text(oldText+String.fromCharCode(ev.which));
			}
			
			
			return true;
		};
		/**
		 * Keydown handles everything that is not text (backspace, delete, enter, etc..)
		 */
		var keyDown = function(ev){
			//ev.preventDefault();
			var node = selectedTarget;
			if( typeof node !== 'undefined' ){
				if(ev.which === 13 ){ // enter (multiline text)
					var textSpan = $(that.svg.other(node, 'tspan'));
					textSpan.attr('x', '50%').attr('dy', window.getComputedStyle(textSpan[0], null).getPropertyValue('font-size') );
					
					//that.hideZebra(); // does make some problems
				}else if(ev.which === 46 || (ev.which === 0 && ev.keyCode === 46) ){ // delete key -> remove group
					removeNode(selectedTarget);
					hideZebra();
				}else if( ev.which === 8 ){ // backspace
					var spanNode = node.children().last();
               var group = node.parent();
					var oldText = spanNode.text();
					
					if( oldText.length !== 0 ){ // delete last char
						spanNode.text(oldText.substr(0, oldText.length-1));
					}
					if( oldText.length === 0){ // remove tspan
						spanNode.remove();
					}
					if( node.children().size() === 0 ){ // remove group
						group.remove();
					}
				}
			}
			return true;
		};
		
		var removeNode = function(target){
			$(target, that.svg.root()).remove();
		};
			
		
		
			
			
		var fileDropped = function(evt){
			evt = evt.originalEvent;
			evt.stopPropagation();
			evt.preventDefault();
		
			var fileList = evt.dataTransfer.files;
			var fReader = new FileReader();
			fReader.onload = function(evt){
				addImage(evt.target.result);
			};
			var f;
			var i;
			for ( i = 0; i < fileList.length; ++i ) {
				if( fileList[i].type.indexOf('image/') >= 0 ){ // image file
					fReader.readAsDataURL(fileList[i]);
				}
			}
		};
		
		var addImage = function(data){
			var selectedNode = selectedGroup;
			if( typeof selectedNode === 'undefined' ){ // new group
		
				var group = $(that.svg.other($('#canvas'), 'g'));
				group.attr('class','group');
				var matrix = that.getTransformationMatrix(that.canvas[0]).inverse();
				group.attr('transform', 'matrix('+matrix.a+' '+matrix.b+' '+matrix.c+' '+matrix.d+' '+matrix.e+' '+matrix.f+')');
				
				selectedGroup = group;
				selectedNode = group;
			}
			// only used to get width/height of images
			var image = new Image();
			image.onload = function(){
				// image( parent, x, y, width, height, url )
				var img = $(that.svg.image(group, ($(document).width()-image.width)/2,  ($(document).height()-image.height)/2, image.width, image.height, data));
				selectedNode.append(img);
				image.src = '';
				selectedTarget = img;
			};
			image.src = data;
		};
       DizzyEditor.prototype.addImage = addImage;
	}

   
   
	return DizzyEditorWrapper;
})(Dizzy, window, document);





// http://bit.ly/dPXli1