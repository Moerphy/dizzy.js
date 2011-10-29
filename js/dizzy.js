/*
 * dizzy.js
 *
 * http://dizzy.metafnord.org
 * @author Murphy (murphy.metafnord.org)
 *
 * @version: 0.5.0
 * @updated: 04/14/2011
 *
 * licensed under the terms of the MIT License
 * http://www.opensource.org/licenses/mit-license.html
 */

 var Dizzy = (function(window, document, D, undefined){
   "use strict"; // strict mode, see: https://developer.mozilla.org/en/JavaScript/Strict_mode
   /*
      Create inherited class with public members
   */
   var Dizzy = D.extend({

      init : function(selector, options){
         // if Dizz is called without new, just return it yourself.
         if( this === window ){
            return new Dizz(selector, presentationOptions);
         }
         this.container = $(selector);
         this.svg = undefined;
         this.canvas = undefined;
         this.currentGroup = 0;

         this.options = mergeObjects( { transformDuration : 1000 }, options );
      },

      load : function(url, callback){
         var that = this;
			this.container
				.empty()
				.removeClass('hasSVG')
				.svg({
					loadURL: url,
					onLoad: (function(svgw){
						that.svg = that.container.svg('get');
						that.canvas = $('g#canvas', that.svg.root() );

						if( !isUndefined(callback) ){
							callback.call(that);
						}
						that.container.trigger('ready.dizzy');
                  that.updateDisplay();
					})
			});
      },

      /**
		 * Checks internal counter against element-classes in svg,
		 * only raises counter if there is at least one element with class '.group'+(counter+1)
		 * @return {Integer} number of now shown group
		 */
      next : function(){
      	var nextSlide = this.currentGroup+1;
			return this.show(nextSlide);
      },

      /**
		 * Checks internal counter against 0,
		 * only decreases counter if it is above 0
		 * @return {Integer} number of now shown group
		 */
      previous : function(){
         var prevSlide = this.currentGroup-1;
			return this.show(prevSlide);
      },

      /**
		 * shows the group with the given number
		 * used by next() and previous().
		 * @param number number of the group to show now or the canvas (0 = canvas, 1..n = group number).
		 * @return {Integer} number of now shown group (basically the input parameter)
		 */
      show : function(index){
         if( index >= 0 && (this.hasGroup(index) || index===0) ){
				this.currentGroup = index;
				this.updateDisplay();
			}

			return index;
      },

      /**
		 * Checks if there is a group defined with the given number
		 * @param number The number of the group to look up.
       */
      hasGroup : function(index){
			return this.getGroup(index).size() > 0;
      },

      /**
		 * Returns all groups (should really only return 1 element)
		 * with the given number from the canvas.
		 * @param number Number of the group to fetch
		 */
      getGroup : function(index){
         /*
			 * maybe some better day I will be able to select like this:
			 * g[dizzy:number~= 42]
			 * see: http://www.w3.org/TR/SVG/extend.html#PrivateElementsAndAttribute
			 * Until now I could not figure out how to do that the right way.. meh.
			 */
			return $('g.group_'+index, this.svg.root());
      },


      /**
		 * Returns the transformationmatrix of the given element.
		 * Does include all transformations from parent-groups (excluding g#canvas).
		 * @param {DOMElement} node
		 * @return {SVGMatrix} consolidated matrix of the node multiplied with the
		 * matrices of all parent g.group's up to the canvas group (excluding)
		 */
      getTransformationMatrix : function(node){
         var that = this;

         if( !isUndefined(node) ){
            if( !isUndefined(node.selector) ){ // jquery object instead of native dom object
               node = node[0];
            }
            var activeGroupTransformBase = node.transform.baseVal; // TODO multiple nodes with that class? shouldn't happen, but who knows..

            if( activeGroupTransformBase.numberOfItems === 0 ){
                var newTransform = this.svg.root().createSVGTransform();
                activeGroupTransformBase.appendItem(newTransform);
            }
            var activeGroupTransformMatrix =  activeGroupTransformBase.consolidate().matrix;
            // subgroups have to be "de-transformed" with the transformations of their parents
            var parentGroups = $(node).parentsUntil('g#canvas, svg');

            /*
             * iterate over parents in the DOM until you hit the #canvas-group
             * multiply parent transformation matrix to undo all of them too..
             */
            parentGroups.each(	function(index){
                              var parent = $(this);
                              var parentBase = parent[0].transform;
                              if( typeof parentBase !== 'undefined' ){
                                 parentBase = parentBase.baseVal;
                              }
                              if( parentBase.numberOfItems === 0 ){
                                 var newTransform = that.svg.root().createSVGTransform();
                                 parentBase.appendItem(newTransform);
                              }
                              var parentMatrix = parentBase.consolidate().matrix;
                              // careful with the order of operands on the multiplication
                              // matrix multiplications are not commutative!
                              activeGroupTransformMatrix = parentMatrix.multiply(activeGroupTransformMatrix);

                           });

            return activeGroupTransformMatrix;
         }
      },

      /**
       * Converts the SVGMatrix-object to a string representation like: "matrix(1 0 0 1 0 0)".
       * Is used for manipulations of the "transformation"-attribute of svg-nodes.
       */
      transformationMatrixToString : function(m){
         return 'matrix('+m.a+' '+m.b+' '+m.c+' '+m.d+' '+m.e+' '+m.f+')';
      },

      /**
		 * Does an animated transform on a group (most of the time this will be the canvas. Used for focusing a transformed group.)
		 * @param {SVGMatrix} matrix The SVGMatrix that's gonna be used for the transform.
		 * @param transformDuration a number indicating the length of the animation in ms.
		 */
      transform : function( node, matrix, duration ){
         if( !isUndefined(node.selector) ){ // jquery object instead of native dom object
            node = node[0];
         }
         var m = matrix;
			if( isUndefined(duration) ){
				duration = this.options.transformDuration;
			}
         if( duration === 0 ){
            $(node).attr('transform', this.transformationMatrixToString(m) );
         }else{
            $(node).animate({svgTransform: this.transformationMatrixToString(m) }, duration);
         }


			this.canvas.trigger('transformed');
      },

      /**
		 * Gets the group that should be displayed and undoes the transformations that have been applied to it.
		 * This is done by fetching the Transformationmatrix of the group, inverse it and apply it to the _canvas group_
		 * (results in a visual transform of the whole image)
		 */
      updateDisplay : function(){
         if( this.currentGroup >= 0 ){


				// get active group or canvas (overview)
				if( this.currentGroup === 0 ){
					// return canvas to "normal" state
					this.canvas.animate({svgTransform:  'matrix(1 0 0 1 0 0)'}, this.options.transformDuration);
				}else{
					var activeGroup = this.getGroup(this.currentGroup);

					if( activeGroup.length > 0 ){
						// get transformationmatrix (SVGMatrix class)
						var activeGroupTransformMatrix = this.getTransformationMatrix(activeGroup[0]);

						// multiply inverse transformation matrix on canvas (should reverse active transformation)
						var newMatrix = activeGroupTransformMatrix.inverse();
						this.transform(this.canvas, newMatrix);
					}
				}
			}
      },

      /**
		 * Converts X/Y values from the mouseevent to SVG-coordinates.
		 * Necessary because SVG can use a relative coordinate space and rotation/scaling.
		 * @param x X-Value in pixel (usually event.pageX)
		 * @param y Y-Value in pixel (usually event.pageY)
		 * @param node optional. Uses the ation of the group to transform the xy-coordinates.
		 * @param ignoreCanvas optional. Indicates if the current transform on the canvas should be ignored. default is false.
		 */
      transformAbsoluteCoordinates : function(x, y, node, ignoreCanvas){
         if( typeof node === 'undefined' ){
				node = this.canvas;
			}
			if( typeof ignoreCanvas === 'undefined' ){
				ignoreCanvas = false;
			}

			var svgPoint = this.svg.root().createSVGPoint();
			svgPoint.x = x;
			svgPoint.y = y;
			if(!isUndefined( node[0] ) &&
            !isUndefined( node[0].transform ) &&
				!isUndefined( node[0].transform.baseVal.consolidate() ) ){

				var canvasMatrix = node[0].transform.baseVal.consolidate().matrix;
            // don't
				if( ignoreCanvas === true ){
					var m2 = this.canvas[0].transform.baseVal.consolidate().matrix;
					canvasMatrix = m2.multiply(canvasMatrix);
				}

				svgPoint = svgPoint.matrixTransform(canvasMatrix.inverse());
			}
			return svgPoint;
      },

      serialize : function(){
		 	// Fixes Chrome. I really have no clue why chrome leaves that out otherwise...
			$(this.svg.root()).attr('xmlns','http://www.w3.org/2000/svg');
			// clean up, remove all empty groups
			$('.group:empty', this.svg.root()).remove();

			return this.svg.toSVG();
		}
   });

   return Dizzy;
 })(window, document, Class);