/*
 * dizzy.js 
 * http://dizzy.metafnord.org
 * 
 * Version: 0.5.0
 * Date: 04/14/2011
 * 
 * licensed under the terms of the MIT License
 * http://www.opensource.org/licenses/mit-license.html
 */
 
 /**
  * Only does the part with the zebra (:
  * Shows zebra on click on element, enables rotation, translation and scaling.
  */
(function(window, document, D, undefined){
   
   var zebraPlugin ={
      name : 'editor.zebra',
      depends : ['editor.tools'],
      options : { 
         zoom : { duration : 50 }
      },
         
      
      initialize : function(dizzy){
         var that = this;
         that.dizzy = dizzy;
         var $document = $(document);
         // rewrite viewbox. Not the nicest thing to do, but makes so many things so much easier.
         that.dizzy.svg.configure({viewBox: '0 0 '+$document.width()+' '+$document.height() }, true);	
 
         $('g.group > *', dizzy.svg.root() ).live('click.dizzy.editor.default', function(event){ return that.showZebra(event); } );
         var zebraHide = (function(event){ that.hideZebra(event); });
         $(document).bind('transformed', zebraHide );  			
         $(document).bind('hideZebra', zebraHide );  		
      },

      
      showZebra : function(ev){
         var that = this;
         var svgRoot = that.dizzy.svg.root();
         
			var zebra = $( '#zebra' );
			zebra.css('opacity', '0.9');
			$( '#zebra  #zebra-rotate').mousedown( function(ev){ return that.zebraRotateStart(ev); } );
			$( '#zebra #zebra-scale').mousedown( function(ev){ return that.zebraScaleStart(ev); } );
			$( '#zebra #zebra-translate').mousedown( function(ev){ return that.zebraTranslateStart(ev); } );
			
         
			var group = $( ev.currentTarget.parentNode, svgRoot );
         
			this.selectedGroup = group;
			this.selectedTarget = $(ev.currentTarget, svgRoot);
         
         this.selectedTarget.addClass('zebraSelected');
         
			// mark group
			group.css('opacity', '0.6');
		
			// display zebra at the mouse position
			zebra.css('left',ev.pageX-75);
			zebra.css('top',ev.pageY-75);
			zebra.show();
			
         var zebraHide = (function(event){ that.hideZebra(event); });
         $(document).bind('transformed', zebraHide );  	
			
			return false;
		},

      hideZebra : function(ev){
         var that = this;
         
			$( '#zebra' ).css('opacity', '');
			$( '#zebra' ).hide();
			
			if( !isUndefined(this.selectedGroup) ){
				this.selectedGroup.css('opacity', '1');
			}
         $('.zebraSelected').removeClass('zebraSelected');
         
			this.selectedGroup = undefined;
			this.selectedTarget = undefined;
         
         $('svg, #canvas', that.dizzy.svg.root()).unbind('mousedown.dizzy.editor.hidezebra');
         
			return true;
		},
      
      
      
      zebraScaleStart : function(event){
         var that = this;
         
			var zebra = $('#zebra');
			var groupMatrix = that.dizzy.getTransformationMatrix(this.selectedGroup);
			this.zebraScaleInfo = { matrix: groupMatrix, xa: parseFloat(zebra.css('left'))+75, ya: parseFloat(zebra.css('top'))+75 };
			
			$( document ).bind('mousemove.dizzy.editor.scale', function(ev){ return that.zebraScale(ev); } );
			var end = function(ev){ return that.zebraScaleEnd(ev); };
			$( document ).bind( 'mouseup.dizzy.editor', end );
			//$( that.svg.root() ).mouseout( end );
		
			return false;
		},
		
		zebraScale : function(event){
         var that = this;
         
			var svgPoint = { x: event.pageX, y: event.pageY};
			
			var cVector = { x: this.zebraScaleInfo.xa - svgPoint.x, y: this.zebraScaleInfo.ya - svgPoint.y };
			var cVectorLength = Math.sqrt( cVector.x*cVector.x +  cVector.y*cVector.y ) / 40; // 40 is about the radius of the scale circle
		
			var groupMatrix = that.dizzy.getTransformationMatrix(this.selectedGroup);
			
			
			var newMatrix = this.zebraScaleInfo.matrix	// translation is used to scale group around center
														.translate(-$(document).width()/2*(cVectorLength-1),-$(document).height()/2*(cVectorLength-1))
														.scale(cVectorLength);
			
			this.selectedGroup.attr( 'transform', that.dizzy.transformationMatrixToString(newMatrix) );
			
			return false;
		},
		
		zebraScaleEnd : function(event){
			$( document ).unbind('mousemove.dizzy.editor.scale');
			$( document ).unbind( 'mouseup.dizzy.editor');
	
			return false;
		},
	
      
      
      zebraTranslateStart : function(event){
         var that = this;
			var groupMatrix = that.dizzy.getTransformationMatrix(this.selectedGroup);
			
			var svgPoint = that.dizzy.transformAbsoluteCoordinates(event.pageX,event.pageY, this.selectedGroup, true, true);
			
			this.zebraTranslateInfo = { x: svgPoint.x, y: svgPoint.y, matrix: groupMatrix };
			
			$( document ).bind('mousemove.dizzy.editor.zebra.translate', function(ev){ return that.zebraTranslate(ev); } );
			var zebraTranslateEndFunction = function(ev){ return that.zebraTranslateEnd(ev); };
			$( document ).bind( 'mouseup.dizzy.editor.zebra.translate', zebraTranslateEndFunction );
			return false;
		},
		
		zebraTranslate : function(event){
			var that = this;
         
			// convert delta values (because SVG works with relative dimensions + rotation + scale)
			var svgPoint = that.dizzy.transformAbsoluteCoordinates(event.pageX,event.pageY, this.selectedGroup, true, true);
			var moveMe = {};
			moveMe.x = svgPoint.x - this.zebraTranslateInfo.x;
			moveMe.y = svgPoint.y - this.zebraTranslateInfo.y;
			
			
			var newMatrix = this.zebraTranslateInfo.matrix.translate(moveMe.x, moveMe.y);
			this.selectedGroup.attr('transform', that.dizzy.transformationMatrixToString(newMatrix) );
			this.zebraTranslateInfo.matrix = newMatrix;
			
			var zebra = $('#zebra');
			var coords = that.dizzy.transformAbsoluteCoordinates(event.pageX,event.pageY, $(that.dizzy.svg.root()), true);
			zebra.css('left', coords.x-75);
			zebra.css('top', coords.y-75);
			
			return false;
		},
		
		zebraTranslateEnd : function(event){
			$( document ).unbind('mousemove.dizzy.editor.zebra.translate');
			$( document ).unbind('mouseup.dizzy.editor.zebra.translate');
			return false;
		},
      
      
      
      zebraRotateStart : function(event){
         var that = this;
			var zebra = $('#zebra');
			var groupMatrix = that.dizzy.getTransformationMatrix(this.selectedGroup);
			var x1 = parseFloat(zebra.css('left'))+75;
			var y1 = parseFloat(zebra.css('top'))+75;
			this.zebraRotateInfo = { 
						xa: x1,
						ya: y1,
						lastVector: {
							x: event.pageX - x1,
							y: event.pageY - y1
						},
						matrix: groupMatrix
			};
			
			$( document ).bind('mousemove.dizzy.editor.rotate', function(ev){ return that.zebraRotate(ev); } );
			
	
			var end = function(ev){ return that.zebraRotateEnd(ev); };
			$( document ).bind('mouseup.dizzy.editor.rotate', end );
		
			return false;
		},
		
		zebraRotate : function(event){
         var that = this;
			var zebra = $('#zebra');
			
			var newVector = {
				x: event.pageX - this.zebraRotateInfo.xa,
				y: event.pageY - this.zebraRotateInfo.ya
			};
			var lastVector = this.zebraRotateInfo.lastVector;
		
			var angle =  180/Math.PI * (Math.atan2(newVector.y,newVector.x) - Math.atan2(lastVector.y,lastVector.x));
		
			var xTranslate = $(document).width()/2;
			var yTranslate = $(document).height()/2;
			// rotate around group center
			var newMatrix = this.zebraRotateInfo.matrix.
										translate(xTranslate, yTranslate).
										rotate(angle).
										translate(-xTranslate, -yTranslate);
		
         var vendorprefixes = ['','-o-', '-webkit-', '-moz-', '-ms-'];
         for( var i = 0; i < vendorprefixes.length; ++i ){
            $( '#zebra-rotate').css(vendorprefixes[i]+'transform', 'rotate('+angle+'deg)');
         }
      
			this.selectedGroup.attr('transform', that.dizzy.transformationMatrixToString(newMatrix) );
			
			return false;
		},
		
		zebraRotateEnd : function(event){
			$( document ).unbind('mousemove.dizzy.editor.rotate');
			$( document ).unbind('mouseup.dizzy.editor.rotate');
			return false;
		},
		
      
      
      
      finalize : function(dizzy){
         this.dizzy = dizzy;
         this.hideZebra();
         $('g.group > *', dizzy.svg.root() ).die('click.dizzy.editor.default');
      } 
      
   };
   
   D.registerPlugin(zebraPlugin);
    
 })(window, document, Dizzy);