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
   
   var presentationPlugin ={
      name : 'presentation',
      depends : [ 'zoom', 'pan', 'keyboardnavigation' ],
      options : { 
         zoom : {
            duration : 200
         }
      },
         
      initialize : function(dizzy,options){
         $(dizzy.svg.root()).removeClass('editing');
      },
      finalize : function(dizzy, options){
         $(dizzy.svg.root()).addClass('editing');
      } 
   };
   
   D.registerPlugin(presentationPlugin);
    
 })(window, document, Dizzy);