/*
 * The text mode allow to create text-groups on the canvas, by opening a textbox on click.
 */
define(['sandbox'],  function(sandbox){

    // components that are needed for text editing:
    var canvas;
    var textBox;
    var textOverlay;
    // 
    var clickOpensTextbox = false;

    var textMode = {
      depends: ['zoom', 'pan'],

      start: function () {
        if( canvas ){
          clickOpensTextbox = true;
          assignEventHandler();
          $(canvas.svg.root()).addClass('editing textmode');
        }
      },

      stop: function () {
        if( canvas ){
          removeEventHandler();
          hideTextbox();
          $(canvas.svg.root()).removeClass('editing textmode');
        }
      }
    };

    function assignEventHandler() {
      // edit text
      $(canvas.svg.root()).delegate('.group', 'click.dizzy.mode.text.edit', function (e) {
        e.stopImmediatePropagation();
        var text = $(this).children('text');
        if (text.size() > 0) {
          e.stopPropagation();
          if (clickOpensTextbox) {
            var group = canvas.getGroup(this);

            var textCoordinates = {
              x: text.attr('x'),
              y: text.attr('y')
            };
            var viewportCoordinates = canvas.toViewboxCoordinates(textCoordinates, true);

            canvas.gotoGroup(group, {
              duration: 100,
              complete: function () {
                showTextbox(group, viewportCoordinates);
              }
            });
          } else {
            hideTextbox();
          }
        }
        return false;
      });
      
      
      // new text
      $(canvas.svg.root()).bind('click.dizzy.mode.text.new', function (e) {
        if (clickOpensTextbox) {
          e.stopPropagation();

          var clickCoordinates = {
            x: e.pageX,
            y: e.pageY
          };
          
          var newGroup = canvas.createGroup();
          var newGroupDom = newGroup.dom();

          var newText = $(canvas.svg.other(newGroupDom, 'text'));
          var newTextSpan = $(canvas.svg.other(newText, 'tspan'));

          var svgOffset = canvas.toViewboxCoordinates(clickCoordinates);

          newText.attr({
            x: svgOffset.x,
            y: svgOffset.y
          });
          newText.append(newTextSpan);
          newGroupDom.append(newText);

          showTextbox(newGroup, {
            x: e.pageX,
            y: e.pageY
          });
        } else {
          hideTextbox();
        }
      });
    }

    function removeEventHandler() {
      $(canvas.svg.root()).unbind('click.dizzy.mode.text.new');
      $(canvas.svg.root()).undelegate('g.group text', 'click.dizzy.mode.text.edit');
    }


    function showTextbox(group, viewportCoordinates) {
      var svgCoordinates = canvas.toViewboxCoordinates(viewportCoordinates);
      var groupDom = group.dom();
      groupDom.addClass('invisible');

      var text = groupDom.find('text');
      var spans = text.children('tspan');

      // update textbox text
      textBox.val('');
      var spanWidth = 0;
      spans.each(function (index) {
        var v = $(this).text();
        if (index < spans.size() - 1) {
          v += '\r\n';
        }
        textBox.val(textBox.val() + v);
      });

      // try to match font size in svg (svg coordinates) to viewport font-size
      var fontSize = parseInt(spans.css('font-size') || text.css('font-size'), 10);
      fontSize *= ($(document).height() / canvas.HEIGHT);

      textBox.bind('change', function (e) {
        text.children().remove();

        var txt = textBox.val();
        if (txt) { // if empty -> removegroup
          var textSpans = text.children('tspan');
          // First convert "\n\n" to "\n \n" (so blank lines are not lost when splitting), then split to array.
          txt = txt.replace(/\r?\n\r?\n/, '\n \n').split('\n');

          var spanYOffset = 0;
          for (var i = 0; i < txt.length; ++i) {
            var linespan = textSpans.eq(i);
            if (linespan.size() === 0) { // there is no textspan for this line
              var newSpan = $(canvas.svg.other(text, 'tspan'));
              text.append(newSpan);
              linespan = newSpan;
            } else {

            }
            linespan.text(txt[i]);

            linespan.attr({
              'dy': spanYOffset,
              'x': svgCoordinates.x
            }); // move font in next line
            spanYOffset = linespan.css('font-size');
          }
        } else {
          canvas.removeGroup(group);
        }
      });

      // resizes the textbox when 
      textBox.bind('input', function (e) {
        var txt = textBox.val();
        // First convert "\n\n" to "\n \n" (so blank lines are not lost when splitting), then split to array.
        txt = txt.replace(/\r?\n\r?\n/, '\n \n').split('\n');

        var maxText = 1;
        for (var i = 0; i < txt.length; ++i) {
          if (txt[i].length > maxText) {
            maxText = txt[i].length;
          }
        }
        textBox.attr({
          'cols': maxText,
          'rows': txt.length || 1
        });
      });

      textOverlay.show();
      textOverlay.css({
        top: viewportCoordinates.y - fontSize,
        left: viewportCoordinates.x
      });
      textBox.css({
        'font-family': spans.css('font-family'),
        'font-size': fontSize,
        'font-weight': spans.css('font-weight'),
        'font-style': spans.css('font-style')
      });
      textBox.trigger('input');
      textBox.trigger('focus');
      clickOpensTextbox = false;
    }

    function hideTextbox() {
      textBox.change();
      $('.invisible').removeClass('invisible');
      textBox.val('');
      textBox.unbind();
      textOverlay.hide();

      clickOpensTextbox = true;
    }

    /*
     * Subscribtions
     */
    sandbox.subscribe('dizzy.presentation.loaded', function (c) {
      canvas = c.canvas;
    });
    // if canvas was panned, don't open up a textbox
    sandbox.subscribe('dizzy.presentation.transform.do', function (data, name) {
      //if( name.indexOf('.end') < 0 ){
      clickOpensTextbox = false;
      //}
    });



    return {
      init: function () {
        var jqxhr = $.get('html/textBox.html').success(function (d) {
          textOverlay = $(d);
          textBox = textOverlay.find('textarea');
          textOverlay.hide();

          $('#container').append(textOverlay);

          sandbox.publish('dizzy.ui.textbox.loaded');
        }).error(function (e) {
          console.error("Could not load textbox: " + e);
        }).complete(function () {
          sandbox.publish('dizzy.modes.register', {
            name: 'tool-text',
            instance: textMode
          });
        });
      },

      destroy: function () {
        if (textOverlay) {
          textOverlay.remove();
        }
      }

    };
  });
