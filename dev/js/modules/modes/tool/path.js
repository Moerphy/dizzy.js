/*
 * In path mode the user can set the sequence of groups to view in the presentation.
 * TODO: this needs a major redesign for the next version. Don't know yet how to make the process of path-setting easier..
 */
define(['sandbox'], function (sandbox) {
  var canvas;

  var pathMode = {
    depends: ['zoom', 'pan'],
    start: function () {
      $(canvas.svg.root()).delegate('g.group', 'click', function (e) {
        addPathNumber(e.target);
      });
      $(canvas.svg.root()).delegate('.pathNumber', 'mousedown', function (e) {
        dragPathNumberStart(e);
      });
      $(canvas.svg.root()).addClass('path');
      createAllPathNumberNodes();
    },

    stop: function () {
      $(canvas.svg.root()).undelegate('g.group', 'click');
      $(canvas.svg.root()).undelegate('.pathNumber', 'mousedown');
      $('.pathnum').remove();
    }
  };


  function addPathNumber(target) {
    var $target = jQuery(target);
    if (!$target.is('g')) {
      $target = $target.closest('g');
    }
    var group = canvas.getGroup($target);
    var number = canvas.addPathNumber(group); // TODO
    group.dom().append(createPathNumberNode(group, number));
  }

  function dragPathNumberStart(event) {
    var $target = $(event.target);
    $target.detach();
    // TODO: attach to canvas
    $(document).bind('mousemove', function (e) {
      var canvasCoordinates = canvas.toCanvasCoordinates({
        x: e.pageX,
        y: e.pageY
      });
      $target.removeAttr('transform'); // TODO
      $target.attr({
        x: canvasCoordinates.x,
        y: canvasCoordinates.y
      });
    });

    var dropTarget = undefined;
    $(canvas.svg.root()).delegate('g.group', 'mouseenter', function (e) {
      dropTarget = e.target;
    });
    $(canvas.svg.root()).delegate('g.group', 'mouseout', function (e) {
      dropTarget = undefined;
    });

    $(document).bind('mouseup mouseleave', function (e) {
      $(document).unbind('mousemove mouseenter mouseout');
      $(canvas.svg.root()).undelegate('g.group', 'mouseenter mouseout');
      if (dropTarget === undefined) {
        var group = canvas.findGroup(dropTarget);
        canvas.addPathNumber(group, 23); // TODO: number
      } else {
        canvas.removePathnumber(canvas.findGroup($target), 23); // TODO: number
      }
    });
    return false;
  }

  function createAllPathNumberNodes() {
    var groupNodes = $('g.group', canvas.svg.root());
    groupNodes.each(function () {
      var group = canvas.findGroup(this);
      var groupNumbers = group.numbers();
      for (var i = 0; i < groupNumbers.length; ++i) {
        createPathNumberNode(group, groupNumbers[i]);
      }
    });
  }

  /**
   * Creates a visual "marker" for the group, in form of a circle with the pathnumber in it
   */

  function createPathNumberNode(group, num) {
    var marker = canvas.svg.ellipse(group.dom(), canvas.WIDTH / 2, canvas.HEIGHT / 2, 100, 100, {
      fill: 'green',
      stroke: 'white'
    });
    marker.addClass('pathnum');
    marker.text(num);
    group.dom().append(marker);
  }
  
  /*
   * Subscribtions
   */
  sandbox.subscribe('dizzy.presentation.loaded', function (c) {
    canvas = c.canvas;
  });

  return {
    init: function () {
      sandbox.publish('dizzy.modes.register', pathMode);
    },
    destroy: function () {}
  };
});
