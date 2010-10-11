
/**
 * Initializes dizzy object with the given selector as container. 
 * On calling load(), an SVG file can be load into the container.
 */
function Dizzy(container, transformDuration) { 
	// container element from html
	this.container = container; 
	 // number of group that is show right now
	this.groupNum = -1;
	// time the animated transformation takes (in ms)
	this.transformTime = (typeof(transformDuration)!='undefined')?transformDuration:1000;
	this.overviewMode = false;
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
				os.show(0);
				})
		});

	//animate({svgTransform:  'rotate(45,20,15)'}, 2000);
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









//I'm sorry, but our princess is in another castle!
