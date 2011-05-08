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
      name : 'editor.lines',
      depends : [ 'zoom' ],
         
      initialize : function(dizzy){
         var that = this;
         this.dizzy = dizzy;
         $(dizzy.svg.root()).addClass('drawing');
         $(dizzy.svg.root()).bind('mousedown.dizzy.editor.line', function(e){ return that.editorLineStart(e); });
         $(dizzy.svg.root()).bind('mouseup.dizzy.editor.line', function(e){ return that.editorLineEnd(e); });
      },
      
      
      editorLineStart : function(ev){
         var that = this;
         ev.stopPropagation();
			ev.preventDefault();
         $(this.dizzy.svg.root()).bind('mousemove.dizzy.editor.line', function(e){ return that.editorLineDrag(e); });
         
         var group = $(this.dizzy.svg.other($('#canvas'), 'g'));
         group.attr('class','group');
         var matrix = this.dizzy.getTransformationMatrix(this.dizzy.canvas).inverse();

         group.attr( 'transform', this.dizzy.transformationMatrixToString(matrix) );
         

         this.line = this.dizzy.svg.line(group, ev.pageX, ev.pageY, ev.pageX, ev.pageY, {stroke: this.dizzy.color.stroke, fill : this.dizzy.color.fill, strokeWidth : 5});
         return false;
      },
      
      editorLineDrag : function(evt){
         evt.stopPropagation();
			evt.preventDefault();
         
         this.line.setAttribute('y2', evt.pageY);
         this.line.setAttribute('x2', evt.pageX);
         
         return false;
      },
      
      editorLineEnd : function(ev){
         $(this.dizzy.svg.root()).unbind('mousemove.dizzy.editor.line');
      },
     
      finalize : function(dizzy){
         $(dizzy.svg.root()).removeClass('drawing');
         $(dizzy.svg.root()).unbind('mousedown.dizzy.editor.line');
         $(dizzy.svg.root()).unbind('mouseup.dizzy.editor.line');
      } 
   };

   D.registerPlugin(linePlugin);
    
 })(window, document, Dizzy);