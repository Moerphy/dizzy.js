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
   
   var pathPlugin ={
      name : 'editor.path',
      depends : [ 'pan', 'zoom' ],
         
      initialize : function(dizzy){
         var that = this;
         
         this.dizzy = dizzy;
         this.maxPathNumber = 0;
         this.insertPathNumbers();
         
         var allGroups = $('g.group', dizzy.svg.root() );
         allGroups.bind('click.dizzy.editor.path', function(e){ that.addPath($(e.currentTarget), parseInt(that.maxPathNumber,10)+1); } );
         
         $(dizzy.svg.root()).addClass('path');
      },
      
      /**
       * Parses classnames (yeah, svg does not have a classList attribute) and insert the numbers in the svg.
       */
      insertPathNumbers : function(){
         var that = this;
         
         var groupNumberParser = /group_(\d+)/;
         $( 'g.group', that.dizzy.svg.root() ).each( function(index){ 
            var node = $(this);
            node.data('pathCount', '0');
            var classes = $(this.getAttribute('class').split(' '));
            classes.each( function(index){
               var matches = groupNumberParser.exec(this);
               if( matches !== null ){
                  for( var i = 1; i < matches.length; ++i ){
                     that.addPath(node, matches[i]);
                  }
               }
            } );
            
         } );
      },
      
      
      
      /**
		 * Adds a group number to a node. Used for making navigation paths through the groups.
		 * @param {DOMElement} node A group that will be the next in the path.
		 * @param num the current groupnumber.
		 */
		addPath : function(node, num){
         var that = this;
         
			var group = node;
			if( !group.is('g.group') ){
				group = $(node).parent('g.group').first();
			}
			var pathCount = group.data('pathCount');
			if( typeof pathCount === 'undefined' ){
				pathCount = 0;
			}
			var pathX = $(document).width()/2.0 + (31*(pathCount%5)) ;
			var pathY = $(document).height()/2.0+ 31*Math.floor(pathCount/5);
			
			group.addClass('group_'+num);
			
			var pathNode = $(that.dizzy.svg.other(group, 'g'));
			pathNode.attr('class','pathNumberIndicator');

			var pathCircle = $(that.dizzy.svg.circle(group, 0, 0, 15));
			pathCircle.attr('fill', '#006000')
			
			var pathText = $(that.dizzy.svg.other(group, 'text'));
			pathText.attr('text-anchor', 'middle')
				.attr('font-size', '20')
				.attr('font-weight', 'bold')
				.attr('y', '5')
				.attr('x', '0')
				.attr('fill','#FFFFFF');
	
	
			pathText.text(num);
			
			pathNode.append(pathCircle);
			pathNode.append(pathText);
			
			pathNode.attr('transform', 'translate('+pathX+' '+pathY+')');
			pathNode.data('number', num);
			
			group.append(pathNode);
			group.data('pathCount', parseInt(pathCount,10)+1);
			
			$('g.pathNumberIndicator',that.dizzy.svg.root() ).bind('mousedown.dizzy.editor.path.move', function(event){ return that.pathNumberDragStart(event); } );
         
         if( num > this.maxPathNumber ){
            this.maxPathNumber = num;
         }
		},
      
      
      
      
      pathNumberDragStart : function(event){
         var that = this;
			event.stopImmediatePropagation();
			
			var pathGroup = $(event.currentTarget);
			
			pathGroup.css('opacity','0.8');
			
         this.pathNumberDragOptions = {};
			this.pathNumberDragOptions.group = pathGroup;
			this.pathNumberDragOptions.from = pathGroup.parent();
			this.pathNumberDragOptions.to = pathGroup.parent();
			
			pathGroup.detach();
			$(that.dizzy.svg.root()).append(pathGroup);
			
			$(document).bind('mousemove.dizzy.editor.path.move', function(e){ return that.pathNumberDrag(e); } );
			$('g.group' ,that.dizzy.svg.root()).bind('mouseenter.dizzy.editor.path.move.group', function(e){ return that.pathNumberDrop(e); } );
			$(document).bind('mouseup.dizzy.editor.path.move', function(e){ return that.pathNumberDragEnd(e); } );
			
			return false;
		},
		
		
		pathNumberDrag : function(event){
			var group = this.pathNumberDragOptions.group;
			group.attr('transform', 'translate('+(event.pageX+20)+' '+(event.pageY+20)+')');
			
		
			return true;
		},
		
		pathNumberDragEnd : function(event){
			event.stopImmediatePropagation();
			var group = this.pathNumberDragOptions.group;
			group.detach();
			
						
			$(document).unbind('mousemove.dizzy.editor.path.move' );
			$('g.group', this.dizzy.svg.root() ).unbind('mouseenter.dizzy.editor.path.move.group' );
			$(document).unbind('mouseup.dizzy.editor.path.move' );
			
			var pathNumber = group.data('number');
			var fromNode = this.pathNumberDragOptions.from;
			var toNode = this.pathNumberDragOptions.to;
			
			this.removePath(fromNode, pathNumber);
			this.addPath(toNode, pathNumber );
			group.remove();
			
			return false;
		},
		
		pathNumberDrop : function(event){
         var that = this;
         
			var group = $(event.currentTarget);

			this.pathNumberDragOptions.to = group;
			// *
			group.bind('mouseleave.dizzy.editor.path.move.group', 
				function(e){ 
					pathNumberDragOptions.to  = this.pathNumberDragOptions.from; 
					group.unbind('mouseleave.dizzy.editor.path.move.group');
				});
			// */
			return true;
		},
      
      removePath : function(node, num){
			var group = node;
			if( !group.is('g.group') ){
				group = $(node).parent('g.group').first();
			}
			var pathCount = group.data('pathCount');
			group.data('pathCount', pathCount-1);
			group.removeClass('group_'+num);
			
			var pathX = $(document).width()/2.0;
			var pathY = $(document).height()/2.0;
			
			group.children('g.pathNumberIndicator').each(
				function(index){
					var numNode = $(this);
					numNode.attr('transform', 'translate('+pathX+' '+pathY+')');
					pathX += 31;
				}
			);
		},
      
      
      
      
      
      
      finalize : function(dizzy){
         $('g.group', dizzy.svg.root() ).unbind('click.dizzy.editor.path');
         $('g.pathNumberIndicator', dizzy.svg.root()).remove();
         
         $(dizzy.svg.root()).removeClass('path');
      } 
   };

   D.registerPlugin(pathPlugin);
    
 })(window, document, Dizzy);