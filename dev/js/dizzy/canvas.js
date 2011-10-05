define(['dizzy/group', 'dizzy/transformation'], function (Group, Transformation) {

  var Canvas = function (c, opt) {
      this.container = $(c);
      this.groupList = [];
      this.activeGroupNumber = 0;
      this.options = opt || {
        transformDuration: 1000
      };
    };

  Canvas.prototype = {
    WIDTH: 2000,
    HEIGHT: 1500,

    /*
     * Loads file into the container via XmlHttpRequest.
     * @param url URL of SVG file to load.
     * @param options Optional object that holds options and callbacks fileloading. Default options are as follows:
     * {
     *    success : function(){},
     *    failure : function(){}
     * }
     */
    load: function (url, options) {
      var that = this;

      options = options || {};
      this.container.disableTextSelect();
      this.container.empty().removeClass('hasSVG').svg({
        loadURL: url,
        onLoad: (function (svgw) {
          that.svg = that.container.svg('get');
          that.canvas = $('g#canvas');
          var groups = that.canvas.find('.group');
          groups.each(function () {
            that.getGroup($(this));
          });

          if (typeof options.success === 'function') {
            options.success();
          }
        })
      });
    },

    /*
     * Converts dom to string representation<
     */
    serialize: function () {
      // Fixes Chrome. I really have no clue why chrome leaves that out otherwise...
      $(this.svg.root()).attr('xmlns', 'http://www.w3.org/2000/svg');
      // clean up, remove all empty groups
      $('.group:empty', this.svg.root()).remove();

      return this.svg.toSVG();
    },


    createGroup: function () {
      var canvas = this.getGroup(0);
      var newGroup = $(this.svg.group(canvas.dom()));

      var newTransform = Transformation.createTransform(canvas.transformation().matrix().inverse());

      newGroup.addClass('group');

      var newDizzyGroup = new Group(newGroup);
      newDizzyGroup.transformation(newTransform);
      this.groupList.push(newDizzyGroup);

      return newDizzyGroup;
    },

    removeGroup: function (g) {
      g.dom().remove();
    },

    /*
     * Finds a group by it's node representation.
     * This is done by comparing ids. Every group gets a random (dom-)id when it is created internally.
     */
    findGroup: function (node) {
      for (var i = 0; i < this.groupList.length; ++i) {
        if (this.groupList[i] && this.groupList[i].dom().attr('id') === $(node).attr('id')) {
          return this.groupList[i];
        }
      }
      var g;
      node = jQuery(node);
      if (node.size() > 0) {
        g = new Group(node[0]);
        this.groupList.push(g);
      }
      return g;
    },

    /*
     * Returns an instance of Dizzy.Group with all the information about a group. Group 0 is the canvas (the "root element"), groups 1 - Inf are the normal groups
     */
    getGroup: function (number) {
      // passed in element is already a group, dummy (o:
      if (number.dom && number.transformation) {
        return number;
      }
      var groupNode;
      if (number > 0) {
        groupNode = this.canvas.find('.group_' + number);
      } else if (number === 0) {
        groupNode = this.canvas;
      }
      var g = this.findGroup(groupNode || number); // there should only be one group with that number
      return g;
    },

    /*
     * Set the internal counter to number and transforms the canvas accordingly
     */
    gotoGroup: function (numberOrGroup, options) {
      if (typeof numberOrGroup !== 'number') {
        numberOrGroup = this.getGroup(numberOrGroup);
      }
      this.activeGroupNumber = numberOrGroup;
      this.current(options);
    },

    /*
     * Increments the internal counter by one, going one step further in the path. Returns new active pathnumber
     */
    next: function () {
      return this.step(1);
    },
    /*
     * Opposite of next()
     */
    previous: function () {
      return this.step(-1);
    },

    step: function (dir) {
      this.activeGroupNumber += dir;
      try {
        var cur = this.current();
      } catch (e) {
        this.activeGroupNumber -= dir;
      }
      return this.activeGroupNumber;
    },

    /*
     * Goes to the group specified by the internal counter (useful, if panning/zooming is allowed). Returns currently active pathnumber.
     */
    current: function (options) {
      var canvas = this.getGroup(0);
      var group = this.getGroup(this.activeGroupNumber);

      if (group !== undefined) {
        var groupTransform = group.transformation();


        var inverseTransform = Transformation.createTransform(groupTransform.matrix());

        this.transform(canvas, inverseTransform, options);


      } else {
        throw "Noez! (o:"
      }

      return this.activeGroupNumber;
    },

    /*
     * Set the transformation of the group to the transformation object.
     */
    transform: function (group, transformation, options) {
      options = $.extend({
        complete: function () {},
        duration: this.options.transformDuration
      }, options);

      var duration = options.duration === undefined ? this.options.transformDuration : options.duration;

      group.transform = transformation;

      if (duration <= 10) { // speed optimization here..
        $(group.dom(), this.svg.root()).attr('transform', transformation.toString());
      } else {
        $(group.dom(), this.svg.root()).animate({
          svgTransform: transformation.toString()
        }, options);
      }
    },

    /**
     * Translates Viewport-Coordinates (Browser coordinates, as returned by many events, like MouseEvent.pageX) to coordinates in the SVG viewbox.
     */
    toViewboxCoordinates: function (xy, reverse) {
      var svgPoint = this.svg.root().createSVGPoint();
      svgPoint.x = xy.x;
      svgPoint.y = xy.y;

      var m1 = this.svg.root().getScreenCTM();
      if (!reverse) {
        m1 = m1.inverse();
      }

      svgPoint = svgPoint.matrixTransform(m1);

      return svgPoint;
    },
    /**
     * Translates Viewport-Coordinates to Coordinates on the Canvas (a subgroup of the viewBox of the svg).
     */
    toCanvasCoordinates: function (xy, reverse) {
      var svgPoint = this.svg.root().createSVGPoint();
      svgPoint.x = xy.x;
      svgPoint.y = xy.y;

      var m1 = this.svg.root().getScreenCTM();
      var m2 = this.getGroup(0).transformation().matrix();

      m1 = m1.multiply(m2);

      if (!reverse) {
        m1 = m1.inverse();
      }

      svgPoint = svgPoint.matrixTransform(m1);

      return svgPoint;
    },

    /*
     * Transforms an XY-vector with the matrix of the canvas.
     * !! mainly deprecated, use toCanvasCoordinates or toViewboxCoordinates when possible. 
     */
    vectorTranslate: function (xy, options) {
      options = options || {};

      options = $.extend({
        ignoreCanvas: false,
        targetNode: undefined,
        inverseMatrix: false
      }, options);

      var svgPoint = this.svg.root().createSVGPoint();
      svgPoint.x = xy.x;
      svgPoint.y = xy.y;

      // matrix that is used for transforming the vector
      var reverseMatrix;

      // transform vector with a given node?
      if (!options.targetNode) {
        // nope, use canvas and/or svg transformation
        var m1 = this.svg.root().getScreenCTM();
        var m2 = this.getGroup(0).transformation().matrix();

        reverseMatrix = m1;
        // reverse canvas transformation
        if (!options.ignoreCanvas) {
          reverseMatrix = reverseMatrix.multiply(m2);
          options.inverseMatrix = true;
        }
        if ( !! options.inverseMatrix) {
          reverseMatrix = reverseMatrix.inverse();
        }
      } else {
        // get matrix of node (probably a group)
        reverseMatrix = options.targetNode.getCTM().inverse();
      }

      svgPoint = svgPoint.matrixTransform(reverseMatrix); // I think this should do the trick.. stupid matrix calculations (o:
      return {
        x: svgPoint.x,
        y: svgPoint.y
      };
    },

    pathCounter: 0,
    /**
     * @param g Group object that the path number is assigned to
     * @param n optional. number that is assigned.
     */
    addPathNumber: function (g, n) {
      if (n === undefined) {
        n = ++pathCounter;
      }
      group.dom().addClass('group_' + n);
      group.numbers().push(n);
    },

    removePathNumber: function (g, n) {
      if (n === undefined) {
        n = [];
      }
      if (typeof n === 'number') {
        n = [n];
      }
      for (var i = 0; i < n.length; ++i) {
        group.dom().removeClass('group_' + n[i]);
        // delete from internal array.
        var numbers = group.numbers();
        var pos = numbers.indexOf(n[i]);
        if (pos >= 0) {
          numbers.splice(pos, 1);
        }
      }
    }
  };

  return Canvas;
});
