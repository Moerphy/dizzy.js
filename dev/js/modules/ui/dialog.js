/*
 * Dialog module provides open and save dialogs.
 *
 * http://dizzy.metafnord.org
 * @author Murphy (murphy.metafnord.org)
 *
 * @updated: 05/13/2011
 * 
 * licensed under the terms of the MIT License
 * http://www.opensource.org/licenses/mit-license.html
 */
define(['sandbox'], function (sandbox) {
  var openDom;
  var overlayDom;

  sandbox.subscribe('ui.dialog.open', openDialog);
  sandbox.subscribe('ui.dialog.save', saveDialog);


  var dialogCallbacks = {
    success: function () {},
    cancel: function () {}
  };

  function openDialog(data) {
    overlayDom.show();
    openDom.show();

    $.extend(dialogCallbacks, data);
  }

  function saveDialog(data) {

  }

  /*
   * Bind event handlers to the "open" dialog.
   */

  function bindOpenEventHandlers(d) {
    openDom.delegate('.dialog-cancel', 'click', function () {
      openDom.hide();
      overlayDom.hide();
      dialogCallbacks.cancel();
    });

    openDom.delegate('.dialog-ok', 'click', function () {
      // local image selected?
      var fileField = openDom.find('.dialog-open-local-input');
      var files = fileField[0].files;

      if ((files.length > 0) && (files[0].type.indexOf('image/') >= 0)) {
        var reader = new FileReader();
        var openFile = files[0];
        reader.onload = function (e) {
          dialogCallbacks.success('dataURL', e.target.result);
        };

        reader.readAsDataURL(openFile);
      } else {
        // link image url
        var imageData = openDom.find('.dialog-open-link-input').val();
        if (imageData !== undefined) {
          dialogCallbacks.success('link', imageData);
        }
      }

      openDom.find('form')[0].reset();

      openDom.hide();
      overlayDom.hide();
    });

  }


  var dialogModule = {
    init: function () {
      var body = $('#container');

      overlayDom = $('#dialog-overlay');
      if (overlayDom.size() === 0) {
        var jqxhr = $.get('html/dialog-overlay.html').success(function (d) {
          overlayDom = $(d);
          overlayDom.hide();
          overlayDom.removeClass('hidden');
          body.prepend(overlayDom);
        });
      }

      openDom = $('#dialog-open');
      if (openDom.size() === 0) {
        var jqxhr = $.get('html/dialog-open.html').success(function (d) {
          openDom = $(d);
          body.prepend(openDom);
          openDom.hide();
          openDom.removeClass('hidden');
          bindOpenEventHandlers();
        });
      }
    },

    destroy: function () {

    }
  };


  return dialogModule;

});
