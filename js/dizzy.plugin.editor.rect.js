/*
 * dizzy.js 
 *
 * http://dizzy.metafnord.org
 * @author Murphy (murphy.metafnord.org)
 *
 * @version: 0.5.0
 * @updated: 04/14/2011
 * 
 * licensed under the terms of the MIT License
 * http://www.opensource.org/licenses/mit-license.html
 */
 
(function(window, document, D, undefined){
   
   var linePlugin ={
      name : 'editor.rect',
      depends : [ 'zoom' ],
         
      initialize : function(dizzy){
         var that = this;
         this.dizzy = dizzy;
         $(dizzy.svg.root()).addClass('drawing');
         $(dizzy.svg.root()).bind('mousedown.dizzy.editor.rect', function(e){ return that.editorRectStart(e); });
         $(dizzy.svg.root()).bind('mouseup.dizzy.editor.rect', function(e){ return that.editorRectEnd(e); });
      },
      
      
      editorRectStart : function(ev){
         var that = this;
         ev.stopPropagation();
			ev.preventDefault();
         $(this.dizzy.svg.root()).bind('mousemove.dizzy.editor.rect', function(e){ return that.editorRectDrag(e); });
         
         var group = $(this.dizzy.svg.other($('#canvas'), 'g'));
         group.attr('class','group');
         var matrix = this.dizzy.getTransformationMatrix(this.dizzy.canvas).inverse();
         matrix = matrix.translate( ev.pageX - $(document).width()/2, ev.pageY - $(document).height()/2 );
         group.attr( 'transform', this.dizzy.transformationMatrixToString(matrix) );
         
         this.circlePosition = { x: ev.pageX, y: ev.pageY };
         
         this.line = this.dizzy.svg.rect(group, $(document).width()/2, $(document).height()/2, 1, 1, {stroke: this.dizzy.color.stroke, fill : this.dizzy.color.fill, strokeWidth : 5});
            
         this.lineGroup = group;   
         this.lineMatrixStart = matrix;
         this.lineStartPos = { x : $(document).width()/2, y : $(document).height()/2 };   
         return false;
      },
      
      editorRectDrag : function(evt){
         evt.stopPropagation();
			evt.preventDefault();
         
         var w =  this.circlePosition.x - evt.pageX;
         var h = this.circlePosition.y - evt.pageY;
         
         this.line.setAttribute('width', Math.abs(w) );
         this.line.setAttribute('height', Math.abs(h) );
         
         var xDelta = -w/2;
         var yDelta = -h/2;
         
         var matrix = this.lineMatrixStart;
         
         var xOffset = 0;
         var yOffset = 0;
         
         if( w > 0 ){
            xOffset += w;
         }
         if( h > 0 ){
            yOffset += h;
         }
         matrix = matrix.translate( xDelta, yDelta );
         
         this.lineGroup.attr( 'transform', this.dizzy.transformationMatrixToString(matrix) );
         
         this.line.setAttribute('x', this.lineStartPos.x - (xDelta+xOffset) );
         this.line.setAttribute('y', this.lineStartPos.y - (yDelta+yOffset) );
        
         
        
         
         /*
         console.trace();
         */

         
         
         return false;
      },
      
      editorRectEnd : function(ev){
         $(this.dizzy.svg.root()).unbind('mousemove.dizzy.editor.rect');
      },
     
      finalize : function(dizzy){
         $(dizzy.svg.root()).removeClass('drawing');
         $(dizzy.svg.root()).unbind('mousedown.dizzy.editor.rect');
         $(dizzy.svg.root()).unbind('mouseup.dizzy.editor.rect');
      } 
   };

   D.registerPlugin(linePlugin);
    
 })(window, document, Dizzy);