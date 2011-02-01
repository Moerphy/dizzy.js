/*
 * dizzy.editor.js 
 * http://dizzy.metafnord.org
 * 
 * Version: 0.2.0
 * Date: 01/20/2011
 * 
 * licensed under the terms of the MIT License
 * http://www.opensource.org/licenses/mit-license.html
 */
Dizzy.prototype.dizzyOptionsBackup = {};
Dizzy.prototype.selectedGroup = undefined;

Dizzy.prototype.editor = function(enable){
	if( enable ){
		// backup old values
		this.dizzyOptionsBackup = { 
				pannable: this.pannable, 
				zoomable: this.zoomable, 
				transformTime : this.transformTime };
		
		// for editing, use other values
		this.pannable = true;
		this.zoomable = true;
		this.transformTime = 200;
		
		// add toolbar
		
		// add zebra
		this.loadZebra();
		
		// add eventhandlers
		var os = this;
		$('g.group > *', this.svg.root() ).live('click', function(event){ return os.showZebra(event); } );
		// not so nice to bind it to document.. but otherwise keypresses won't fire somehow o_O
	
		$(document).bind('keypress.dizzy.editor', function(event){ return os.keyPressed(event); });
		$(document).bind('keydown.dizzy.editor', function(event){ return os.keyDown(event); });
		// allow images to be dragged on the canvas. (:
		// I love this feature, although not supported in Opera ):
		if (window.File && window.FileReader && window.FileList) {
			$(this.svg.root()).bind('dragover.dizzy.editor', function(evt){ evt.stopPropagation(); evt.preventDefault(); } );
			$(this.svg.root()).bind('drop.dizzy.editor', function(evt){ os.fileDropped(evt); } );
		}
	}else{
		this.pannable = this.dizzyOptionsBackup.pannable;
		this.zoomable = this.dizzyOptionsBackup.zoomable;
		this.transformTime = this.dizzyOptionsBackup.transformTime;
		
		// remove toolbar
		
		// remove zebra
		this.removeZebra();
		// remove eventhandlers
		$('g.group > *', this.svg.root() ).die('click');
		$(document).unbind('keypress.dizzy.editor');

	}
};

Dizzy.prototype.loadZebra = function(){
	var os = this;
	$( 'svg#zebra', this.svg.root() ).hide();
};

Dizzy.prototype.removeZebra = function(){
	$( '#zebra', this.svg.root() ).remove();
};


Dizzy.prototype.zebraScaleStart = function(event){
	var os = this;
	var groupMatrix = this.getTransformationMatrix(this.selectedGroup[0]);
	this.zebraScaleInfo = { x: event.pageX, y: event.pageY, matrix: groupMatrix };
	
	$( this.svg.root() ).bind('mousemove.dizzy.editor.scale', function(ev){ return os.zebraScale(ev); } );
	var end = function(ev){ return os.zebraScaleEnd(ev); };
	$( this.svg.root() ).bind( 'mouseup.dizzy.editor', end );
	//$( this.svg.root() ).mouseout( end );

	return false;
};

Dizzy.prototype.zebraScale = function(event){
	var xOffset = Math.abs(event.pageX - this.zebraScaleInfo.x);
	var yOffset = Math.abs(event.pageY - this.zebraScaleInfo.y);
	
	var distance = Math.sqrt( xOffset*xOffset + yOffset*yOffset );
	
	if( this.first == false ){
		this.zebraScaleInfo.matrix = this.zebraScaleInfo.matrix.translate(-250, -250);
		this.first = true;
	}
	
	var newMatrix = this.zebraScaleInfo.matrix.scale(distance/10);
	
	this.selectedGroup.attr('transform', 'matrix('+newMatrix.a+' '+newMatrix.b+' '+newMatrix.c+' '+newMatrix.d+' '+newMatrix.e+' '+newMatrix.f+')');
	
	return false;
};

Dizzy.prototype.zebraScaleEnd = function(event){
	$( this.svg.root() ).unbind('mousemove.dizzy.editor');
	$( this.svg.root() ).unbind( 'mouseup.dizzy.editor');
	//this.selectedGroup.getClass
	return false;
};



Dizzy.prototype.zebraTranslateStart = function(event){
	var os = this;
	var groupMatrix = this.getTransformationMatrix(this.selectedGroup[0]);
	
	var svgPoint = this.transformCoordinates(event.pageX,event.pageY, this.selectedGroup, true);
	
	this.zebraTranslateInfo = { x: svgPoint.x, y: svgPoint.y, matrix: groupMatrix };
	
	$( this.svg.root() ).bind('mousemove.dizzy.editor.zebra.translate', function(ev){ return os.zebraTranslate(ev); } );
	this.zebraTranslateEndFunction = function(ev){ return os.zebraTranslateEnd(ev); };
	$( this.svg.root() ).bind( 'mouseup.dizzy.editor.zebra.translate', this.zebraTranslateEndFunction );
	//$( this.svg.root() ).mouseout( end );
	return false;
};

Dizzy.prototype.zebraTranslate = function(event){
	
	// convert delta values (because SVG works with relative dimensions + rotation + scale)
	var svgPoint = this.transformCoordinates(event.pageX,event.pageY, this.selectedGroup, true);
	var moveMe = {};
	moveMe.x = svgPoint.x - this.zebraTranslateInfo.x;
	moveMe.y = svgPoint.y - this.zebraTranslateInfo.y;
	
	
	
	var newMatrix = this.zebraTranslateInfo.matrix.translate(moveMe.x, moveMe.y);
	this.selectedGroup.animate({svgTransform: 'matrix('+newMatrix.a+' '+newMatrix.b+' '+newMatrix.c+' '+newMatrix.d+' '+newMatrix.e+' '+newMatrix.f+')'},0);
	this.zebraTranslateInfo.matrix = newMatrix;
	
	var zebra = $('#zebra', this.svg.root());

	return false;
};

Dizzy.prototype.zebraTranslateEnd = function(event){
	$( this.svg.root() ).unbind('mousemove.dizzy.editor.zebra.translate');
	$( this.svg.root() ).unbind('mouseup.dizzy.editor.zebra.translate');
	return false;
};



Dizzy.prototype.zebraRotateStart = function(event){
	var os = this;
	var groupMatrix = this.getTransformationMatrix(this.selectedGroup[0]);
	this.zebraRotateInfo = { x: event.pageX, y: event.pageY, matrix: groupMatrix };
	
	$( this.svg.root() ).bind('mousemove.dizzy.editor', function(ev){ return os.zebraRotate(ev); } );
	this.currentZebraRotation = 0;
	var end = function(ev){ return os.zebraRotateEnd(ev); };
	$( document ).bind('mouseup.dizzy.editor', end );

	return false;
};

Dizzy.prototype.zebraRotate = function(event){
	var zebra = $('svg#zebra', this.svg.root());
	var canvasMatrix = this.zebraRotateInfo.matrix;
	// arc of rotate-circle is r*PI*(alpha/180), which makes a total arc of 2*PI*r
	// calculate distance of mousemove
	var xDelta = this.zebraRotateInfo.x - event.pageX;
	var yDelta = event.pageY - this.zebraRotateInfo.y;
	
	var distance = Math.sqrt(xDelta*xDelta + yDelta*yDelta);
	var alpha = (distance/628.318)*360;
	
	this.currentZebraRotation += alpha;
	var newMatrix = this.zebraRotateInfo.matrix.
								translate(canvasMatrix.e, canvasMatrix.f).
								rotate(this.currentZebraRotation).
								translate(-canvasMatrix.e, -canvasMatrix.f);
	
	
	this.zebraRotateInfo.x = event.pageX;
	this.zebraRotateInfo.y = event.pageY;
	
	this.selectedGroup.animate({svgTransform: 'matrix('+newMatrix.a+' '+newMatrix.b+' '+newMatrix.c+' '+newMatrix.d+' '+newMatrix.e+' '+newMatrix.f+')'}, 0);
	$( '#zebra_rotate', this.svg.root() ).animate({svgTransform: 'rotate('+this.currentZebraRotation+', 50, 50)'}, 0);
	return false;
};

Dizzy.prototype.zebraRotateEnd = function(event){
	$( this.svg.root() ).unbind('mousemove.dizzy.editor');
	$( document ).unbind('mouseup.dizzy.editor');
	return false;
};



Dizzy.prototype.transformed = function(){};

Dizzy.prototype.showZebra = function(ev){
	var os = this;
	
	var zebra = $( 'svg#zebra', this.svg.root() );
	$( 'svg#zebra #zebra_rotate', this.svg.root() ).mousedown( function(ev){ return os.zebraRotateStart(ev); } );
	$( 'svg#zebra #zebra_scale', this.svg.root() ).mousedown( function(ev){ return os.zebraScaleStart(ev); } );
	$( 'svg#zebra #zebra_translate', this.svg.root() ).mousedown( function(ev){ return os.zebraTranslateStart(ev); } );
	
	var group = $( ev.currentTarget.parentNode, this.svg.root() );
	
	// zoom in on element, disabled for now.
	 var groupMatrix = this.getTransformationMatrix(group[0]);
	// this.transformCanvas(groupMatrix.inverse());
	
	this.selectedGroup = group;
	this.selectedTarget = $(ev.currentTarget, this.svg.root());
	
	// mark group
	group.attr('opacity', '0.5');

	// display zebra somewhere on that element
	zebra.attr('x',500);
	zebra.attr('y',500);
	zebra.show();
	
	$('svg, #canvas').bind('mousedown.dizzy.editor.hidezebra', $.proxy(os.hideZebra, os) );
	
	return false;
	
};

Dizzy.prototype.hideZebra = function(ev){
	$( 'svg#zebra', this.svg.root() ).hide();
	
	if( typeof this.selectedGroup !== 'undefined' ){
		this.selectedGroup.removeAttr('opacity');
		this.selectedGroup = undefined;
	}
	var os = this;
	$('svg, #canvas').unbind('mousedown.dizzy.editor.hidezebra');
	this.selectedTarget = undefined;
	return true;
};

/**
 * Keypressed handles all text input.
 */
Dizzy.prototype.keyPressed = function(ev){
	ev.preventDefault();
	var node = this.selectedTarget;

	if( typeof node === 'undefined' ){ // new text node
		var group = $(this.svg.other($('#canvas'), 'g'));
		group.attr('class','group');
		var matrix = this.getTransformationMatrix(this.canvas[0]).inverse();
		group.attr('transform', 'matrix('+matrix.a+' '+matrix.b+' '+matrix.c+' '+matrix.d+' '+matrix.e+' '+matrix.f+')');
		var text = $(this.svg.other(group, 'text'));
		text.attr('font-size', '50').attr('x','500').attr('y', '500');
		
		group.append(text);
		//$('#canvas', this.svg.root()).append(groupNode);
		this.selectedGroup = group;
		this.selectedTarget = text;
		node = text;
	}
	var oldText = node.text();
	if( ev.which === 8 ){ // backspace
		if( oldText.length === 0 ){ // remove group
			group.remove();
		}else{ // delete last char
			node.text(oldText.substr(0, oldText.length-1));
		}
	}else{
		node.text(oldText+String.fromCharCode(ev.which));
	}

	
	return false;
};
/**
 * Keydown handles everything that is not text (backspace, delete, enter, etc..)
 */
Dizzy.prototype.keyDown = function(ev){
	ev.preventDefault();
	var node = this.selectedTarget;
	
	if(ev.which === 13 ){ // enter (multiline text not supported yet ):
		this.hideZebra();
	}else if(ev.which === 46 || ev.which === 0 && ev.keyCode === 46 ){ // delete key -> remove group
		this.removeNode(this.selectedTarget);
	}
	return false;
};

Dizzy.prototype.removeNode = function(target){
	$(target).remove();
};

Dizzy.prototype.fileDropped = function(evt){
	var os = this;
	evt = evt.originalEvent;
	evt.stopPropagation();
	evt.preventDefault();

	var fileList = evt.dataTransfer.files;
	var fReader = new FileReader();
	fReader.onload = function(evt){
		os.addImage(evt.target.result);
	};
	var f;
	for (var i = 0; i < fileList.length; ++i) {
		if( fileList[i].type.indexOf('image/') >= 0 ){ // image file
			fReader.readAsDataURL(fileList[i]);
		}
	}
};

Dizzy.prototype.addImage = function(data){
	var selectedNode = this.selectedGroup;
	if( typeof selectedNode === 'undefined' ){ // new group

		var group = $(this.svg.other($('#canvas'), 'g'));
		group.attr('class','group');
		var matrix = this.getTransformationMatrix(this.canvas[0]).inverse();
		group.attr('transform', 'matrix('+matrix.a+' '+matrix.b+' '+matrix.c+' '+matrix.d+' '+matrix.e+' '+matrix.f+')');
		
		this.selectedGroup = group;
		selectedNode = group;
	}
	// image( parent, x, y, width, height, url )
	var img = $(this.svg.image(group, 500, 500, 500, 500, data));
	selectedNode.append(img);
	this.selectedTarget = img;
};














// meanwhile, back at the ranch..