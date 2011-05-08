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
      name : 'editor.circles',
      depends : [ 'zoom' ],
         
      initialize : function(dizzy){
         var that = this;
         this.dizzy = dizzy;
         $(dizzy.svg.root()).addClass('drawing');
         $(dizzy.svg.root()).bind('mousedown.dizzy.editor.circle', function(e){ return that.editorCircleStart(e); });
         $(dizzy.svg.root()).bind('mouseup.dizzy.editor.circle', function(e){ return that.editorCircleEnd(e); });
      },
      
      
      editorCircleStart : function(ev){
         var that = this;
         ev.stopPropagation();
			ev.preventDefault();
         $(this.dizzy.svg.root()).bind('mousemove.dizzy.editor.circle', function(e){ return that.editorCircleDrag(e); });
         
         var group = $(this.dizzy.svg.other($('#canvas'), 'g'));
         group.attr('class','group');
         var matrix = this.dizzy.getTransformationMatrix(this.dizzy.canvas).inverse();
         matrix = matrix.translate( ev.pageX - $(document).width()/2, ev.pageY - $(document).height()/2 );
         group.attr( 'transform', this.dizzy.transformationMatrixToString(matrix) );
         
         this.circlePosition = { x: ev.pageX, y: ev.pageY };
         
         this.line = this.dizzy.svg.ellipse(group, '50%', '50%', 1, 1, {stroke: this.dizzy.color.stroke, fill : this.dizzy.color.fill, strokeWidth : 5});
         return false;
      },
      
      editorCircleDrag : function(evt){
         evt.stopPropagation();
			evt.preventDefault();
         
         this.line.setAttribute('rx', Math.abs(this.circlePosition.x - evt.pageX));
         this.line.setAttribute('ry', Math.abs(this.circlePosition.y - evt.pageY));
         
         return false;
      },
      
      editorCircleEnd : function(ev){
         $(this.dizzy.svg.root()).unbind('mousemove.dizzy.editor.circle');
      },
     
      finalize : function(dizzy){
         $(dizzy.svg.root()).removeClass('drawing');
         $(dizzy.svg.root()).unbind('mousedown.dizzy.editor.circle');
         $(dizzy.svg.root()).unbind('mouseup.dizzy.editor.circle');
      } 
   };

   D.registerPlugin(linePlugin);
    
 })(window, document, Dizzy);