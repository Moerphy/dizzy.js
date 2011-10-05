/*
 * Does the binding of the items in the main toolbar-menu.
 */
define(['sandbox'], function (sandbox) {
  var canvas;
  var toolbar;
  /*
   * Subcriptions:
   */
  /*
   * Toolbar is loaded, bind menu items.
   */
  sandbox.subscribe('dizzy.ui.toolbar.loaded', function (tool) {
    toolbar = tool.toolbar;
  });

  sandbox.subscribe('dizzy.presentation.loaded', function (c) {
    canvas = c.canvas;
  });

  sandbox.subscribe('dizzy.ui.toolbar.clicked.tool-next', function () {
    canvas.next();
  });
  sandbox.subscribe('dizzy.ui.toolbar.clicked.tool-previous', function () {
    canvas.previous();
  });
  sandbox.subscribe('dizzy.ui.toolbar.clicked.present-toggle-button', function (c) {
    toolbar.find('.toolbutton').not(':first-child, :last-child').toggle();
  });

  return {
    init: function () {},
    destroy: function () {}
  };

});
