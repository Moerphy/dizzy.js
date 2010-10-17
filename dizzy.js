
/**
 * Initializes dizzy object with the given selector as container. 
 * On calling load(), an SVG file can be load into the container.
 */
function Dizzy(container, options) { 
		// default values for variables..
		// container element from html
		this.container = container; 
		 // number of group that is show right now
		this.groupNum = -1;
		// time the animated transformation takes (in ms)
		this.transformTime = 1000;
		// determines how much zooming is made on zoom() call. 1 = none, 2 = double/halve zoomfactor, etc..
		this.zoomFactor = 2;
		// determines if canvas is pannable
		this.pannable = true;
		// determines if canvas is zoomable
		this.zoomable = true;
		
		for( opt in options ){
			if( typeof opt != 'function' && typeof this[opt] != 'undefined' ){
				this[opt] = options[opt];
			}
		}
}  

/**
 * Loads a SVG file into the given container element.
 */
Dizzy.prototype.load = function(url) {  
	// save outer scope for inner function later
	var os = this;
	$(this.container).svg({
			loadURL: url, 
			onLoad: (function(svgw){
				os.svg = $(os.container).svg('get');
				os.canvas = $('#canvas', os.svg.root() );
				
				if( os.pannable ){
					os.isPanning = false;
					$(os.svg.root()).mousedown($.proxy(os.startpanning, os));
					$(os.svg.root()).mousemove($.proxy(os.panning, os));
					$(os.svg.root()).mouseup($.proxy(os.endpanning, os));
				}
				
				
				os.show(0);
				})
		});

	

	return this;
}; 


/**
 * Checks if there is a group defined with the given number
 */
Dizzy.prototype.hasGroupNumber = function(number){
	// jQuery function $ returns array with elements matching given selector
	return this.getGroups(number).length > 0;
}
/**
 * Returns all groups with the given number from the canvas.
 * 
 */
Dizzy.prototype.getGroups = function(number){
	// maybe some better day I will be able to select like this:
	// g[dizzy:number~= 42]
	// see: http://www.w3.org/TR/SVG/extend.html#PrivateElementsAndAttribute
	// browser support: meh.
	return $('g.group_'+number, this.svg.root());
}
/**
 * Just returns the internal counter
 */
Dizzy.prototype.getShownGroupNumber =  function(){
	return parseInt(this.groupNum);
}

/**
 * Checks internal counter against element-classes in svg, 
 * only raises counter if there is at least one element with class '.group'+(counter+1)
 */
Dizzy.prototype.next  =  function(){
	var nextSlide = parseInt(this.groupNum)+1;	
	this.show(nextSlide);
	return this;
};

/**
 * Checks internal counter against 0, 
 * only decreases counter if it is above 0
 */
Dizzy.prototype.previous =  function(){
	this.show(this.groupNum-1);
	return this;
}
/**
 * shows the group with the given number
 * used by next() and previous().
 */
Dizzy.prototype.show =  function(number){

	if( number >= 0 && (this.hasGroupNumber(number)||number==0) ){
		this.groupNum = number;
		this.updateDisplay();
	}

	return this;
}



/**
 * Gets the group that should be displayed and undoes the transformations that have been applied to it.
 * This is done by fetching the Transformationmatrix of the group, inverse it and apply it to the _canvas group_ 
 * (results in a visual transform of the whole image)
 */
Dizzy.prototype.updateDisplay =  function(){
	if( this.groupNum >= 0 ){
		
		var activeGroup;

		// get active group or canvas (overview)
		if( this.groupNum == 0 ){
			activeGroup = $('#canvas');
			$(this.canvas).animate({svgTransform:  'matrix(1 0 0 1 0 0)'}, this.transformTime);
		}else{
			activeGroup =this.getGroups(this.groupNum);

			if( activeGroup.length > 0 ){
				// get transformationmatrix (SVGMatrix class)
				var activeGroupTransformBase = activeGroup[0].transform.baseVal; // TODO multiple nodes with that class?
				
				if( activeGroupTransformBase.numberOfItems == 0 ){
					 var newTransform = this.svg.root().createSVGTransform();
					 activeGroupTransformBase.appendItem(newTransform);
				}
				var activeGroupTransformMatrix = activeGroupTransformBase.consolidate().matrix;
				
				// subgroups have to be "de-transformed" with the transformations of their parents
				var parentGroups = $(activeGroup[0]).parentsUntil('g#canvas');
				
				/* 
				 * iterate over parents in the DOM until you hit the #canvas-group
				 * multiply parent transformation matrix to undo all of them too..
				 */
				parentGroups.each(	function(index){
										var parent = $(this);
										var parentBase = parent[0].transform.baseVal;
										if( parentBase.numberOfItems == 0 ){
											var newTransform = this.svg.root().createSVGTransform();
											parentBase.appendItem(newTransform);
										}
										var parentMatrix = parentBase.consolidate().matrix;
										// careful with the order of operands on the multiplication
										// matrix multiplications are not commutative!
										activeGroupTransformMatrix = parentMatrix.multiply(activeGroupTransformMatrix);
										
									});
				
				
				// multiply inverse transformation matrix on canvas (should reverse active transformation)
				var newMatrix = activeGroupTransformMatrix.inverse();
				
				$(this.canvas).animate({svgTransform:  'matrix('+newMatrix.a+' '+newMatrix.b+' '+newMatrix.c+' '+newMatrix.d+' '+newMatrix.e+' '+newMatrix.f+')'}, this.transformTime);
			}
		}
		
	}	
}
/**
 * Zooms in/out one unit, based on the given argument. 
 * @args zoomInOut -1 for zooming out one unit, +1 for zooming in
 */
Dizzy.prototype.zoom = function(zoomInOut){
	if( this.zoomable ){
		//because I am to tired to think of a nice mathematical way to do this now.. this has to do..
		if( zoomInOut > 0 ){
			zoomInOut = this.zoomFactor;
		}else{
			zoomInOut = 1/this.zoomFactor;
		}
		zoomInOut = zoomInOut;
		
		//this.freeTransform.setScale(1,1);
	
		var newMatrix = $(this.canvas, this.svg.root())[0].transform.baseVal.consolidate().matrix;
		newMatrix = newMatrix.scale(zoomInOut);
	
		
		$(this.canvas).animate({svgTransform:  'matrix('+newMatrix.a+' '+newMatrix.b+' '+newMatrix.c+' '+newMatrix.d+' '+newMatrix.e+' '+newMatrix.f+')'}, this.transformTime);
	}
}
/**
 * Converts X/Y values from the mouseevent to SVG-coordinates. 
 * Necessary because SVG can use a relative coordinate space and rotation/scaling.
 */
Dizzy.prototype.convertAbsoluteToRelative = function(x, y){
	var canvasMatrix = $(this.canvas)[0].transform.baseVal.consolidate().matrix;
	var svgPoint = this.svg.svg().createSVGPoint();
	svgPoint.x = x;
	svgPoint.y = y;
	svgPoint = svgPoint.matrixTransform(canvasMatrix.inverse());
	
	return svgPoint;
}

var pan = {};
/**
 * starts the panning, saves current mouseposition
 */
Dizzy.prototype.startpanning = function(ev){
	this.mouseClicked = true;
	
	var canvasMatrix = $(this.canvas)[0].transform.baseVal.consolidate().matrix;
	
	var svgPoint = this.convertAbsoluteToRelative(ev.pageX, ev.pageY);
	
	pan.x = svgPoint.x;
	pan.y = svgPoint.y;
}

/**
 * Pans the canvas by the offset from pan/ev.pageXY. Usually called as mousemoved()
 */
Dizzy.prototype.panning = function(ev){
	if( this.mouseClicked ){
		var canvasMatrix = $(this.canvas)[0].transform.baseVal.consolidate().matrix;
		
		// convert delta values (because SVG works with relative dimensions + rotation + scale)
		var svgPoint = this.convertAbsoluteToRelative(ev.pageX, ev.pageY);
		var moveMe = {};
		moveMe.x = svgPoint.x - pan.x;
		moveMe.y = svgPoint.y -pan.y;

		canvasMatrix = $(this.canvas)[0].transform.baseVal.consolidate().matrix;
		canvasMatrix = canvasMatrix.translate( moveMe.x, moveMe.y);
		var newMatrix = canvasMatrix;
		$(this.canvas).attr('transform','matrix('+newMatrix.a+' '+newMatrix.b+' '+newMatrix.c+' '+newMatrix.d+' '+newMatrix.e+' '+newMatrix.f+')');
	
		svgPoint = this.convertAbsoluteToRelative(ev.pageX, ev.pageY);
		pan.x = svgPoint.x;
		pan.y = svgPoint.y;
	
	}

}
/**
 * Ends the panning, usually called as mouseup()
 */
Dizzy.prototype.endpanning = function(ev){
	this.mouseClicked = false;
}






// Longcat is loooooooooooooooooooooooooooooooooooooooooooooooo..
// ..oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo..
// ..oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo..
// ..ng.