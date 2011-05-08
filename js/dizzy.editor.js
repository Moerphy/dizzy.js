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
 
 var Dizzy = (function(window, document, D, undefined){
   /*
      Create inherited class with public members
   */
   var DizzyEditorWrapper = D.extend({
      
      
      init : function(){
         this._super.apply(this, arguments);
         var that = this;
         $(document).bind('dizzy.color.changed', function(e){ 
            that.color = e;
         });
      },
      
      color : { 
         stroke : '#FFFFFF',
         fill : '#000000'
      }
      
   });
   
   return DizzyEditorWrapper;
 })(window, document, Dizzy);