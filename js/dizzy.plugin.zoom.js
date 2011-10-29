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

   var zoomPlugin ={
      name : 'zoom',
      depends : [],
      options : {
         duration : 200,
         factor : 2
      },

      initialize : function(dizzy){
         var that = this;
         $(document).bind('mousewheel', function(e, delta){ // mousewheel support for scrolling in canvas
				that.zoom(dizzy, delta, e);
         });

      },

      zoom : function( dizzy, zoomInOut, e){
         // for, e.g., factor 2 this gets either 2 or 1/2
         zoomInOut = Math.pow(this.options.factor, zoomInOut);

         var newMatrix = dizzy.getTransformationMatrix(dizzy.canvas);

         // if mouse event is passed, scale with the mouseposition as center (roughly)
         //translate( -centerX*(factor-1), -centerY*(factor-1))
         if( !isUndefined(e) ){
            var mousePoint = dizzy.transformAbsoluteCoordinates(e.pageX, e.pageY);
            newMatrix = newMatrix.translate(-mousePoint.x*(zoomInOut-1), -mousePoint.y*(zoomInOut-1));
         }

         newMatrix = newMatrix.scale(zoomInOut);

         dizzy.transform(dizzy.canvas, newMatrix, this.options.duration);
         $(document).trigger('transformed');
      },

      finalize : function(){
         $(document).unbind('mousewheel');
      }
   };

   D.registerPlugin(zoomPlugin);

 })(window, document, Dizzy);