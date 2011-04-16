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
      Private members
   */
   var plugins = {};
   var stateBackup = {};   
   /*
      Create inherited class with public members
   */
   var DizzyPluginManager = D.extend({
      
      
      init : function(){
         this._super.apply(this, arguments);
         for( p in plugins ){
            p.state = false;
         }
      },
      
      /**
       * Registers plugin. If there is already a plugin with that name, this will do nothing.
       */
      
      
      /**
       * Calls either initialize() or finalize() on plugin.
       */
      setPluginState : function(name, value, options){
         var plug = plugins[name];

         if( isUndefined(plug) ){
            console.warn("Requested plugin '"+name+"' not registered in dizzy!");
         }else{
            var dependencies = plug.depends;
            
            plug.dependencies = {};
            for( var i in dependencies ){
               var plugin = this.setPluginState(dependencies[i], value, plug.options[dependencies[i]]);
               if( !isUndefined(plugin) ){
                  plug.dependencies[plugin.name] = plugin;
               }
            }
            
            /*
             * call the corresponding method. First set the prototype, so the plugin can access methods of the dizzy object
             */
            //plug.prototype = this; // TODO this is so not standard..
            if( plug.state !== value ){ // Only switch state once!
               if( value === true ){ // initialize
                  plug.optionsBackup = plug.options;
                  plug.options = mergeObjects(plug.options, options);
                  plug.initialize(this);
               }else{ // finalize
                  plug.options = plug.optionsBackup || plug.options;
                  plug.finalize(this);
               }
               plug.state = value;
            }
            return plug;
         }
         
      },
      
      /**
       * Disables the current plugin and enables the plugin with the given name, if present.
       */
      switchPlugin : function(name){
         this.activePlugin = name;
         for( var p in plugins ){
            this.setPluginState(p, false);
         }
         return this.setPluginState(name, true);
      },
      
      savePluginState : function(){
         this.stateBackup = this.activePlugin;
      },
      
      restorePluginState : function(){
         this.switchPlugin(this.stateBackup);
      }
      
      
   });
   
   DizzyPluginManager.registerPlugin = function(p){
      if( isUndefined(plugins[p.name]) ){
         p.options = p.options || {};
         plugins[p.name] = p;
         //this.setPluginState(p.name, false);
      }
   };
    
   return DizzyPluginManager;
 })(window, document, Dizzy);