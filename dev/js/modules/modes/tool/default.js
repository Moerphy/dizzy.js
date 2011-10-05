/*
 * The default mode is the mode in which groups can be moved, resized and rotated. 
 * TODO: as soon as the user starts typing it should activate text mode and open the text box with the typed text (similiar to the old version)
 */
define(['sandbox'], function (sandbox) {
  var canvas;

  var ready = false;

  var defaultMode = {
    depends: ['zoom', 'pan', 'zebra'],
    start: function () {
      if (ready) {
        $(canvas.svg.root()).addClass('editing');
        this.bindMouselistener();
      }
    },

    stop: function () {
      if (ready) {
        $(canvas.svg.root()).removeClass('editing');
        this.unbindMouselistener();
      }
    },

    bindMouselistener: function () {
      var svg = canvas.svg.root();
      $(svg).delegate('g.group', 'click.dizzy.default touchstart.dizzy.default', function (e) {
        e.preventDefault();
        e.stopPropagation();

        var g = canvas.findGroup(this);
        sandbox.publish('dizzy.presentation.group.selected', {
          group: g,
          event: e
        });

        return false;
      });

    },

    unbindMouselistener: function () {
      var svg = canvas.svg.root();
      $(svg).undelegate('g.group', 'click.dizzy.default  touchstart.dizzy.default'); // undelegate everything under .dizzy.default namespace
    }


  };

  sandbox.subscribe('dizzy.presentation.loaded', function (c) {
    canvas = c.canvas;
    ready = true;
  });

  var selected;
  sandbox.subscribe('dizzy.presentation.group.selected', function (g) {
    if (selected !== undefined) {
      $(selected).removeClass('selected');
    }
    selected = $(g.group.dom());
    selected.addClass('selected');
  });

  sandbox.subscribe('dizzy.presentation.transform', function () {
    if (selected !== undefined) {
      selected.removeClass('selected');
      sandbox.publish('dizzy.presentation.group.unselected');
    }
  });

  return {
    init: function () {
      sandbox.publish('dizzy.modes.register', {
        name: 'tool-default',
        instance: defaultMode
      });

    },
    destroy: function () {}
  };

});
