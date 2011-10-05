/*
 * Switches between different modes, making sure there is only one active mode. 
 */
define(['sandbox'], function (sandbox) {
  var modes = {};


  var obj = {
    init: function () {},
    destroy: function () {}
  };

  function startMode(name) {
    var mod = modes[name];
    if (mod === undefined) {
      console.log("Mode " + name + " called but not defined");
    } else {
      console.log("Starting mode: " + name);
      var dependencies = mod.depends || [];
      for (var i = 0; i < dependencies.length; ++i) {
        startMode(dependencies[i]);
      }
      mod.start();
    }
  }

  function stopModes() {
    for (var m in modes) {
      if( modes[m] && typeof modes[m].stop === 'function' ){
        modes[m].stop();
      }
    }
  }

  sandbox.subscribe('dizzy.ui.toolbar.clicked', function (data, name) {
    stopModes();
    startMode(data.button);
  });

  sandbox.subscribe('dizzy.modes.register', function (data, name) {
    var mod = modes[data.name];
    if (mod === undefined) {
      console.log("Registering mode: " + data.name);
      modes[data.name] = data.instance;
    } else {
      console.log("Mode " + data.name + " already defined");
    }
  });

  return obj;

});
