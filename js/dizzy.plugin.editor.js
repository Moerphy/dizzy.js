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
 
 /**
  * Only does the part with the zebra (:
  * Shows zebra on click on element, enables rotation, translation and scaling.
  */
(function(window, document, D, undefined){
   
   var editorPlugin ={
      name : 'editor',
      depends : [ 'zoom', 'pan', 'editor.text', 'editor.images', 'editor.zebra'],
      options : { 
         zoom : { duration : 50 }
      },
         
      
      initialize : function(dizzy){
         $(dizzy.svg.root()).addClass('editor');
      },
      
      
      
      finalize : function(dizzy){
         $(dizzy.svg.root()).removeClass('editor');
      } 
      
   };
   
   D.registerPlugin(editorPlugin);
 })(window, document, Dizzy);