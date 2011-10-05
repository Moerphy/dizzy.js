define(function () {
  "use strict";

  /*
   * Creates a new Transformation from either a SVGMatrix or an object like the following:
   * {
   *    translation : { x : 0, y : 0 },
   *    rotation : 45, // degree
   *    scaling : 0.5
   * }
   */
  var Transformation = function (matrix) {
    this.transformationMatrix = matrix;
  };

  /*
   * Methods proxy methods of SVGMatrix, with one little difference. Changes on the object (via translate, rotate, scale) change the matrix of this object.
   * These methods do not return a new object, but "this".
   */
  Transformation.prototype = {

    /*
     * Gets or sets the current matrix
     */
    matrix: function (optionalMatrix) {
      if (optionalMatrix !== undefined) {
        this.transformationMatrix = optionalMatrix;
      } else {
        return this.transformationMatrix;
      }
    },

    rotate: function (d, x, y) {
      if (arguments.length < 3) { // no rotation point specified
        x = 0;
        y = 0;
      }
      this.matrix(
      this.matrix().translate(x, y).rotate(d).translate(-x, -y));

      return this;
    },


    scale: function (d) {
      this.matrix(this.matrix().scale(d));
      return this;
    },

    translate: function (x, y) {
      this.matrix(this.matrix().translate(x, y));
      return this;
    },

    inverse: function () {
      this.matrix(this.matrix().inverse());
      return this;
    },

    multiply: function (m) {
      m = m.transformationMatrix || m; // Dizzy.Transformation or CTM?
      this.matrix(this.matrix().multiply(m));
      return this;
    },

    /*
     * Returns a string representation of the Transformation-Matrix like "matrix(1 0 0 1 0 0)" for use in the DOM
     */
    toString: function () {
      var m = 'matrix';
      var values = this.toArray().join(', ');

      return m + '(' + values + ')';
    },

    toArray: function () {
      var matrix = this.matrix();
      return [matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f];
    }

  };

  /*
   * Helper function, makes getting a transformation easier.
   */
  Transformation.createTransform = function (obj) {
    // obj is Dizzy.Group ?
    if (obj.dom && obj.transformation) {
      obj = obj.transformation();
    }
    // obj is Dizzy.Transformation ?
    if (obj.transformationMatrix) {
      obj = obj.transformationMatrix;
    }

    // obj is SVG-Element?
    if (obj.getCTM) {
      obj = obj.getCTM();
    }

    // obj is an SVGMatrix ?
    if (obj.toString().indexOf('SVGMatrix') >= 0) {
      return new Transformation(obj);
    }

    // sorry no Transform for you >:-/
  };

  return Transformation;
});
