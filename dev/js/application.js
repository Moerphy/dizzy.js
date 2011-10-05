/*
 * Application core handles module registration/creation [and abstracts away the base lib (jQuery, dojo, YUI..) | TODO! ]
 */
define(['sandbox'], function(sandbox){

  var application = function(){
    this.modules = {};
    this.sandBox = sandbox;
    this.allStarted = false;
  };

  application.prototype = {
    registerModule: function (name, factory) {
      if (arguments.length === 1) { // name ommited
        factory = name;
        name = ''+Math.random();
      }

      if (!(name in this.modules)) {
        this.modules[name] = [];
      }
      var mod;
      if( typeof factory === 'function' ){
        mod = {
          'builder': factory
        }
      }else{
        mod = {
          'instance': factory
        };
      }
      this.modules[name].push(mod);
      if( this.allStarted ){
        this.start(name);
      }
    },

    start: function (name) {
      if (name in this.modules) {
        var moduleList = this.modules[name];
        for (var i = 0; i < moduleList.length; ++i) {
          if( moduleList[i].builder ){
            moduleList[i].instance = moduleList[i].builder(this.sandBox);
          }          
        }

      }
    },

    initialize: function (name) {
      if (name in this.modules) {
        var module = this.modules[name];
        for (var i = 0; i < module.length; ++i) {
          if ('init' in module[i].instance) {
            module[i].instance.init();
          }
        }

      }
    },

    stop: function (name) {
      if (name in this.modules) {
        var module = this.modules[name];
        for (var i = 0; i < module.length; ++i) {
          if ('destroy' in module[i].instance) {
            module[i].instance.destroy();
            module[i].instance = undefined;
          }
        }
      }
    },

    startAll: function () {
      this.allStarted = true;
      for (var mod in this.modules) {
        this.start(mod);
      }

      for (var mod in this.modules) {
        this.initialize(mod);
      }

    },

    stopAll: function () {
      this.allStarted = false;
      for (var mod in this.modules) {
        this.stop(mod);
      }
    }
  };

  return new application();
});
