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
   
   var imagePlugin ={
      name : 'editor.images',
      depends : [],
         
      initialize : function(dizzy){
        var that = this;
         this.dizzy = dizzy;
         
         // allow images to be dragged on the canvas. (:
         // I love this feature, although not supported in Opera ):
         if (window.File && window.FileReader && window.FileList) {
            $(dizzy.svg.root()).bind('dragover.dizzy.editor', function(evt){ evt.stopPropagation(); evt.preventDefault(); } );
            $(dizzy.svg.root()).bind('drop.dizzy.editor', function(evt){ return that.fileDropped(evt); } );
         }
         $(document).bind('addImage', function(evt, data){ 
            return that.addImage(data); } );
      },
      
      fileDropped : function(evt){
         var that = this;
         
         evt = evt.originalEvent;
			evt.stopPropagation();
			evt.preventDefault();
		
			var fileList = evt.dataTransfer.files;
			var fReader = new FileReader();
			fReader.onload = function(evt){
				$(document).trigger('addImage', [evt.target.result] );
			};
			var f;
			var i;
			for ( i = 0; i < fileList.length; ++i ) {
				if( fileList[i].type.indexOf('image/') >= 0 ){ // image file
					fReader.readAsDataURL(fileList[i]);
				}
			}
      },
      
      addImage : function(data){
         var that = this;
         var selectedNode = $('.zebraSelected');
		
         var group = $(that.dizzy.svg.other($('#canvas'), 'g'));
         group.attr('class','group');
         var matrix = that.dizzy.getTransformationMatrix(that.dizzy.canvas).inverse();
         group.attr('transform', that.dizzy.transformationMatrixToString(matrix) );
         
         selectedGroup = group;
         selectedNode = group;
         selectedNode.addClass('zebraSelected');

			// only used to get width/height of images
			var image = new Image();
			image.onload = function(){
				// image( parent, x, y, width, height, url )
				var img = $(that.dizzy.svg.image(group, ($(document).width()-image.width)/2,  ($(document).height()-image.height)/2, image.width, image.height, data));
				selectedNode.append(img);
				image.src = '';
				selectedTarget = img;
			};
			image.src = data;
      },
      
      finalize : function(dizzy){
         if (window.File && window.FileReader && window.FileList) {
            $(dizzy.svg.root()).unbind('dragover.dizzy.editor');
            $(dizzy.svg.root()).unbind('drop.dizzy.editor');
         }
         $(document).unbind('addImage');
      } 
   };

   D.registerPlugin(imagePlugin);
    
 })(window, document, Dizzy);