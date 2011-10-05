define(['dizzy/transformation'], function (Transformation) {

  var groupNumberMatch = /group_(\d+)/g;

  var Group = function (nodeOrTransform, optionalNumbers) {
    if (nodeOrTransform.inverse && nodeOrTransform.multiply) { // passed argument is transform
      // set transform
      this.transformation(nodeOrTransform);
      if (optionalNumbers !== undefined) {
        this.numbers = optionalNumbers;
      }
      this.dom($('<g class="group" transform="' + this.transformation() + '" />'));

    } else { // passed argument is a node
      var node = nodeOrTransform[0] || nodeOrTransform; // in case argument was jQuery object
      var $node = $(node);
      this.numbers = optionalNumbers || [];
      var classes = $node.attr('class');
      // match list of classNumbers with regex above. Gets the numbers only.
      var groupNumber;
      while ((groupNumber = groupNumberMatch.exec(classes)) !== null) {
        this.numbers.push(parseInt(groupNumber[1]));
      }
      // get transformation matrix
      var transformMatrix = node.parentNode.getTransformToElement(node);
      // var transformMatrix = node.transform.baseVal.consolidate();  // does not handle untransformed elements very well
      // var transformMatrix = node.getCTM(); // gets the multiplied matrix from the top (<svg>) down
      // matrix from getCTM includes transformations from parents
/*
         var parents = $node.parentsUntil('svg');
         if( $node.attr('id') === 'canvas' ){
            parents.add('svg');
         }
         parents.each(function(){
            var ctm = this.getCTM() || this.getScreenCTM();
            //transformMatrix = transformMatrix.multiply( ctm.inverse() );
         });
         //*/

/*
         var activeGroupTransformBase = node.transform.baseVal; // TODO multiple nodes with that class? shouldn't happen, but who knows..
         var activeGroupTransformMatrix =  activeGroupTransformBase.consolidate().matrix;
         transformMatrix = activegroupTransformMatrix;
         */

      this.dom(node);
      this.transform = new Transformation(transformMatrix);
    }
    if (this.dom().attr('id') === undefined) {
      this.dom().attr('id', 'g' + Math.random());
    }
  };

  Group.prototype = {

    /*
     * Gets or sets the dom content of the group returns jQuery wrapper for '<g class="group ..."> <...> </g>'
     */
    dom: function (optionalDom) {
      if (optionalDom === undefined) {
        return this.domContent;
      } else {
        this.domContent = $(optionalDom);
        return this;
      }
    },


    numbers: function () {
      return this.numbers;
    },

    /**
     * Gets or sets the transform of the group, depending on wether the parameter is set or not.
     */
    transformation: function (setTransform) {
      if (setTransform === undefined) {
        return this.transform;
      } else {
        this.transform = setTransform;
        $(this.dom()).attr('transform', setTransform.toString());
        return this;
      }
    }

  };

  return Group;
});
