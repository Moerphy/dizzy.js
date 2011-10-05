/*
 * The toolbar module loads the toolbar on the left and assigns all event handler to it (except for presentation controls).
 */
define(['sandbox'],  function (sandbox) {
  var canvas;
  var containerId = 'dizzy';
  var toolbar;

  // subscribe to own and foreign events (o:
  sandbox.subscribe('dizzy.ui.toolbar.clicked', function (d) {
    var button = toolbar.find('#' + d.button);
    button.siblings().removeClass('pressed');
    button.addClass('pressed');
  });


  return {

    init: function () {
      var that = this;

      // create a container for dizzy svg file
      var body = $('#container');

      var jqxhr = $.get('html/toolbar.html').success(function (d) {
        body.prepend(d);
        toolbar = body.find('#toolbar');
        sandbox.publish('dizzy.ui.toolbar.loaded', {
          toolbar: toolbar
        });
      }).error(function (e) {
        // TODO
      }).complete(function () {
        that.assignEventHandlers();
        // click default button
        var firstButton = $('#toolbar .toolbutton.pressed').click();
      });

    },

    /*
     * Assigns event handlers to the toolbar buttons.
     * A click on the button triggers a publish to the above function (that does the 
     */
    assignEventHandlers: function () {
      // event delegation, "this" referrs to .toolbutton that has been clicked
      toolbar.delegate('.toolbutton', 'click', function (e) {
        var $target = $(this);

        // publish a message to the sandbox notifying the editing methods
        var buttonId = $target.attr('id');
        /*
         * includes the button id in both message-name and message data. 
         * Since we use namespacing, modules can just subscribe to "dizzy.ui.toolbar.clicked" and get every button click
         */
        sandbox.publish('dizzy.ui.toolbar.clicked.' + buttonId, {
          button: buttonId
        });
      });

    },

    destroy: function () {
      $('#toolbar, #menu').remove();
    }

  };

});

