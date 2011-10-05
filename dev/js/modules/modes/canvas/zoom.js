/*
 * Provides the zoom functionality to the canvas.
 */
define(['sandbox'], function (sandbox) {
  var canvas;
  var enabled = false;

  var zoomMode = {
    start: function () {
      enabled = true;
    },

    stop: function () {
      enabled = false;
    }
  };

  var obj = {
    init: function () {
      sandbox.publish('dizzy.modes.register', {
        name: 'zoom',
        instance: zoomMode
      });
    },
    destroy: function () {}
  };

  var last;
  sandbox.subscribe('dizzy.io.mouse.wheel', function (d) {
    if (enabled) {
      var delta = d.delta;

      // maps the +1/-1 delta to a value like 0.5 / 2 for zooming
      var zoomInOut = Math.pow(2, delta); // TODO: options (2) configurable
      var canvasGroup = canvas.getGroup(0);
      var canvasTransform = canvasGroup.transformation();

      var mousePoint = canvas.vectorTranslate({
        x: d.event.pageX,
        y: d.event.pageY
      });
      canvasTransform.translate(-mousePoint.x * (zoomInOut - 1), -mousePoint.y * (zoomInOut - 1));

      canvasTransform.scale(zoomInOut);

      canvas.transform(canvasGroup, canvasTransform, {
        duration: 10
      });
      sandbox.publish('dizzy.presentation.transform.start');
      sandbox.publish('dizzy.presentation.transform');
      sandbox.publish('dizzy.presentation.transform.end');
    }
  });

  sandbox.subscribe('dizzy.presentation.loaded', function (c) {
    canvas = c.canvas;
  });


  return obj;

});
