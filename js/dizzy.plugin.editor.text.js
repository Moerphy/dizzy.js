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

(function(window, document, D, undefined){

   var textPlugin ={
      name : 'editor.text',
      depends : [],
      options : {},

      initialize : function(dizzy){
         var that = this;
         that.dizzy = dizzy;

         // not so nice to bind it to document.. but since it's not a form element or anything..
         $(document).bind('keypress.dizzy.editor', function(event){ return that.keyPressed(event); });
         $(document).bind('keydown.dizzy.editor',  function(event){ return that.keyDown(event); });
      },



      keyPressed : function(ev){
         var that = this;

			ev.preventDefault();
			var node = $('.zebraSelected').first();

			if( node.size() === 0 ){ // new text node

				var group = $(that.dizzy.svg.other($('#canvas'), 'g'));
				group.attr('class','group');

				var matrix = that.dizzy.getTransformationMatrix(that.dizzy.canvas).inverse();
				group.attr('transform', that.dizzy.transformationMatrixToString(matrix));
				var text = $(that.dizzy.svg.other(group, 'text'));
				var textSpan = $(that.dizzy.svg.other(node, 'tspan'));
            text.attr({
               y : '50%',
               stroke : this.dizzy.color.stroke,
               fill : this.dizzy.color.fill
            });
				//text.attr('y', '50%');
				textSpan.attr('x', '50%');

				text.append(textSpan);
				group.append(text);

				text.addClass('zebraSelected');
				node = text;
			}
			node = node.children().last();
			var oldText = node.text();
			if( ev.which !== 0 && ev.which !== 8 ){ // backspace
				node.text(oldText+String.fromCharCode(ev.which));
			}


			return true;
		},

		/**
		 * Keydown handles everything that is not text (backspace, delete, enter, etc..)
		 */
		keyDown : function(ev){
         var that = this;
			//ev.preventDefault();
			var node = $('.zebraSelected').first();
			if( node.size() !== 0 ){
				if(ev.which === 13 ){ // enter (multiline text)
					var textSpan = $(that.dizzy.svg.other(node[0], 'tspan'));
					textSpan.attr('x', '50%').attr('dy', window.getComputedStyle(textSpan[0], null).getPropertyValue('font-size') );
					// TODO !
					//that.hideZebra(); // does make some problems
               return false;
				}else if(ev.which === 46 || (ev.which === 0 && ev.keyCode === 46) ){ // delete key -> remove group
					this.removeNode(node.parents('g.group'));

               $(document).trigger('hideZebra');

               return false;
				}else if( ev.which === 8 ){ // backspace
					var spanNode = node.children('tspan').last();
               var group = node;
					var oldText = spanNode.text();

					if( oldText.length !== 0 ){ // delete last char
						spanNode.text(oldText.substr(0, oldText.length-1));
					}
					if( oldText.length === 0){ // remove tspan
						spanNode.remove();
					}
					if( node.children().size() === 0 ){ // remove group
						group.remove();
                  $(document).trigger('hideZebra');
					}
               return false;
				}
			}
			return true;
		},

		removeNode : function(target){
			$(target, this.dizzy.svg.root()).remove();
		},






      finalize : function(){
         $(document).unbind('keypress.dizzy.editor');
         $(document).unbind('keydown.dizzy.editor');
      }
   };

   D.registerPlugin(textPlugin);

 })(window, document, Dizzy);