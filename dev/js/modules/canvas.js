/*
 * The canvas module does load a SVG object and provides access to methods on Dizzy.Canvas
 */
define(['sandbox', 'dizzy/canvas'], function (sandbox, Canvas) {
  var canvas;
  var containerId = 'dizzy';
  var dizzyContainer;


  /*
   * Subcriptions:
   */
  /*
   * Loads a requested presentation.
   */
  sandbox.subscribe('dizzy.presentation.load', function (d) {
    if (canvas !== undefined && dizzyContainer !== undefined) {
      dizzyContainer.addClass('loading');
      var file = d.file;
      canvas.load(file, {
        success: function () {
          canvas.gotoGroup(0);
          sandbox.publish('dizzy.presentation.loaded', {
            canvas: canvas
          });

          $(window).bind('resize', function () {
            var $svg = $(canvas.svg.root());
            $svg.width($(document).width());
            $svg.height($(document).height());
          });
          $(window).resize();

          //canvas.gotoGroup(0);
          dizzyContainer.removeClass('loading');
        }
      });
    }
  });

  return {

    init: function () {

      // create a container for dizzy svg file
      var body = $('#container');
      dizzyContainer = $('<div id="' + containerId + '" class="loading" />');
      body.append(dizzyContainer);
      dizzyContainer.disableTextSelect();

      canvas = new Canvas('#' + containerId);


      sandbox.publish('dizzy.presentation.load', {
        file: './svg/blank.svg'
      });

      dizzyContainer.bind('mousedown', function (e) {
        sandbox.publish('dizzy.canvas.io.mouse.down', e);
      });
      dizzyContainer.bind('mouseup', function (e) {
        sandbox.publish('dizzy.canvas.io.mouse.up', e);
      });
      dizzyContainer.bind('click', function (e) {
        sandbox.publish('dizzy.canvas.io.mouse.click', e);
      });
    },

    destroy: function () {
      $(containerId).remove();
    }

  };

});
