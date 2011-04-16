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
   
   var toolPlugin ={
      name : 'editor.tools',
      depends : [],
         
      
      initialize : function(dizzy){
         var that = this;
         this.dizzy = dizzy;
         
         $('#zebra-toolbar-up').bind('click', function(){
            that.raiseLayer();
         });
         $('#zebra-toolbar-down').bind('click', function(){
            that.lowerLayer();
         });
         
      },
      
      		
		lowerLayer : function(){
         var node = $('.zebraSelected', this.dizzy.svg.root());
         if( !node.hasClass('group') ){
            node = node.parents('g.group').first();
         }
         node.insertBefore(node.prev('g.group'));
      },
      
      raiseLayer : function(){
         var node = $('.zebraSelected', this.dizzy.svg.root());
         if( !node.hasClass('group') ){
            node = node.parents('g.group').first();
         }
         node.insertAfter(node.next('g.group'));
      },
      
      
      finalize : function(dizzy){
         $('#zebra-toolbar-up').unbind('click');
         $('#zebra-toolbar-down').unbind('click');
      } 
      
   };
   
   D.registerPlugin(toolPlugin);
    
 })(window, document, Dizzy);