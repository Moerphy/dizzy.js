/*
 * Does the binding of the items in the main toolbar-menu (save, open, etc...)
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
    var menu = $('#menu');

    sandbox.subscribe('dizzy.ui.toolbar.clicked.menu-button', function () {
      menu.toggleClass('hidden');
      sandbox.publish('dizzy.ui.canvas.focus', {
        hasFocus: menu.hasClass('hidden')
      });
    });


    menu.delegate('.menu-option', 'click', function () {
      var id = $(this).attr('id');

      switch (id) {
      case 'menu-open':
        sandbox.publish('dizzy.ui.dialog.file.open', {
          ok: function () {},
          cancel: function () {}
        });
        break;
      };
    });


    menu.find('#menu-save').bind('click', function (e) {
      var svgProlog = '<?xml version="1.0" encoding="UTF-8"?>';

      var svgText = canvas.serialize();
      var svgBase64 = 'data:image/svg+xml;charset=utf-8;base64,' + $.base64Encode(svgText);
      window.open(svgBase64);
    });


  });

  sandbox.subscribe('dizzy.presentation.loaded', function (c) {
    canvas = c.canvas;
  });

  return {
    init: function () {},
    destroy: function () {}

  };

});
