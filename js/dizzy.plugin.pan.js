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
 
(function(window, document, D, undefined){
   
   var panPlugin ={
      name : 'pan',
      depends : [],
         
      initialize : function(dizzy){
         var that = this;
         this.panningInfo = {};
         $(dizzy.svg.root()).bind( 'mousedown', function(e){ 
            return that.startPanning(dizzy, e); 
         });
      },
      
      startPanning : function( dizzy, ev ){
         var that = this;
         
         // prevents that ugly default-dragging of svg elements :>
         ev.preventDefault();

         var svgPoint = dizzy.transformAbsoluteCoordinates(ev.pageX, ev.pageY);

         this.panningInfo.x = svgPoint.x;
         this.panningInfo.y = svgPoint.y;

         var endpan = function(e){ return that.endPanning(dizzy, e); };
         var doc = $(document);
         doc.
            bind( 'mousemove.dizzy.panning', function(e){ return that.panning(dizzy, e); } ).
            bind( 'mouseup.dizzy.panning', endpan ).
            // mouseout would fire if the mouse gets dragged over an descendant, mouseleave does not
            bind( 'mouseleave.dizzy.panning', endpan ); 
         $(document).trigger('transformed');

         return false;
      },
      
      panning : function( dizzy, ev ){
         var canvasMatrix = dizzy.getTransformationMatrix(dizzy.canvas); // 
			
			// convert delta values (because SVG works with relative dimensions + rotation + scale)
			var svgPoint = dizzy.transformAbsoluteCoordinates(ev.pageX, ev.pageY);
			var moveMe = {
            x : (svgPoint.x - this.panningInfo.x),
            y : (svgPoint.y - this.panningInfo.y)
         };
         
			canvasMatrix = dizzy.getTransformationMatrix(dizzy.canvas);
			canvasMatrix = canvasMatrix.translate( moveMe.x, moveMe.y);
			var newMatrix = canvasMatrix;
			dizzy.canvas.attr('transform',dizzy.transformationMatrixToString(newMatrix));
		
			svgPoint = dizzy.transformAbsoluteCoordinates(ev.pageX, ev.pageY);
			this.panningInfo.x = svgPoint.x;
			this.panningInfo.y = svgPoint.y;
	
         
			return false;
      },
      
      endPanning : function( dizzy, ev ){
         ev.stopPropagation();
			var doc = $(document);
			doc.unbind('mousemove.dizzy.panning');
         
         this.panningInfo = {};
         
			return false;
      },
      
      finalize : function(dizzy){
         $(dizzy.svg.root()).unbind( 'mousedown' );
      } 
   };

   D.registerPlugin(panPlugin);
    
 })(window, document, Dizzy);