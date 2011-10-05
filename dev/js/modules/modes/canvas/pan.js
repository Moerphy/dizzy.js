/*
 * Provides the pan functionality to the canvas.
 */
define(['sandbox'], function (sandbox) {
  var canvas;
  var enabled = false;

  /*
   * Mode to register
   */
  var panMode = {
    start: function () {
      enabled = true;
    },

    stop: function () {
      enabled = false;
    }
  };


  /*
   * Subscriptions
   */
  var mouseMoved;
  sandbox.subscribe('dizzy.canvas.io.mouse.down', function (d) {
    mouseMoved = false;
    if (enabled) {

      var $target = $(document);
      var position = {
        x: d.pageX,
        y: d.pageY
      };
      position = canvas.vectorTranslate(position);

      sandbox.publish('dizzy.presentation.transform.start');

      $target.bind('mousemove.dizzy.canvas.pan', function (e) {
        mouseMoved = true;
        var newPost = {
          x: e.pageX,
          y: e.pageY
        };
        newPost = canvas.vectorTranslate(newPost);

        var svgCanvas = canvas.getGroup(0);
        var newTransform = svgCanvas.transformation().translate(newPost.x - position.x, newPost.y - position.y);

        sandbox.publish('dizzy.presentation.transform.do');

        canvas.transform(svgCanvas, newTransform, {
          duration: 0
        });
      });
    }
  });

  sandbox.subscribe('dizzy.canvas.io.mouse.up', function (d) {
    $(document).unbind('mousemove.dizzy.canvas.pan');
    sandbox.publish('dizzy.presentation.transform.end');
    return !mouseMoved;
  });

  sandbox.subscribe('dizzy.presentation.loaded', function (c) {
    canvas = c.canvas;
  });


  return {
    init: function () {
      sandbox.publish('dizzy.modes.register', {
        name: 'pan',
        instance: panMode
      });
    },
    destroy: function () {}
  };

});
