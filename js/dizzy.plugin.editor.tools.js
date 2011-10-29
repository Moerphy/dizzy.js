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
          $('#zebra-toolbar-group').bind('click', function(){
            that.group();
         });
         $('#zebra-toolbar-ungroup').bind('click', function(){
            that.ungroup();
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

      group : function(){
         var nodes = $('.zebraSelected', this.dizzy.svg.root()).parents('g.group');
         var firstNode = nodes.first();
         for( var i = 1; i < nodes.size(); ++i ){
            firstNode.append(nodes[i].children());
            firstNode.addClass( nodes[i].attr('class') );
         }

      },

      ungroup : function(){
         var node = $('.zebraSelected', this.dizzy.svg.root());
         if( !node.hasClass('group') ){
            node = node.parents('g.group').first();
         }
         var newGroups = node.children().not(':first');
         node.after(newGroups.wrap('<g class="group" />'));

      },

      finalize : function(dizzy){
         $('#zebra-toolbar-up').unbind('click');
         $('#zebra-toolbar-down').unbind('click');
         $('#zebra-toolbar-group').unbind('click');
         $('#zebra-toolbar-ungroup').unbind('click');
      }

   };

   D.registerPlugin(toolPlugin);

 })(window, document, Dizzy);