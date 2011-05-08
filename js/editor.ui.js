$(function(){   
	var containerSelector = '#dizzy';
	$(containerSelector)
		.height($(document).height())
		.width($(document).width())
		.focus();
	
	var dizz = new Dizzy(containerSelector , {zoomable: true, pannable: true, transformTime: 1000, zoomFactor: 2} );
	

   loadPresentation('./svg/blank.svg');

	
	function loadPresentation(uri){
		
		dizz.load(uri, 
			function(){ 
            this.switchPlugin('editor');
				dizz.show(0);
            // load default css in edit-box
            $('#menu-style-css-input').val( $('#dizzy-internal-style').text() );
            $(this.container).removeClass('loading');
			} );
	}
   
   
   
	var toolbar = $('#toolbar');
   /*
    * Toolbar
    */
   function selectButton(node){
      $(node).siblings().removeClass('pressed');
		$(node).addClass('pressed');
      //dizz.hideZebra();
   }
   $('#tool-default').click( function(e){ 
		dizz.switchPlugin('editor'); 
		selectButton(this);
	} );
   $('#tool-path').click( function(e){ 
		dizz.switchPlugin('editor.path'); 
		selectButton(this);
	} );
   $('#tool-circle').click( function(e){ 
		dizz.switchPlugin('editor.circles'); 
		selectButton(this);
	} );
   $('#tool-rect').click( function(e){ 
		dizz.switchPlugin('editor.rect'); 
		selectButton(this);
	} );
   $('#tool-line').click( function(e){ 
		dizz.switchPlugin('editor.lines');
		selectButton(this);
	} );
   
   /*
    * previous- and next-buttons in presentation mode
    */

   $('#tool-previous').click( function(e){ 
		dizz.previous();
	} );  
   $('#tool-next').click( function(e){ 
		dizz.next();
	} );     
      
   var mouseMoved = false;
   var mouseMovedTimeout = 0;
   var mouseInterval = 500;
   $('#present-toggle-button').toggle(
      function(){ 
         dizz.switchPlugin('presentation');
         mouseMovedTimeout = setTimeout( checkMouseMove, mouseInterval );
         $(document).bind('mousemove', function(){ mouseMoved = true; } );
         $(document).bind('keydown.presentation.navigation', function(ev){ presentationKeypress(ev); } );
         $('.toolbutton').not(':first-child, :last-child').toggleClass('hidden');
         $('#present-toggle-button').children('span').text('End'); 
      },
      function(){ 
         dizz.switchPlugin('editor');
         clearTimeout( mouseMovedTimeout );
         selectButton($('#tool-default'));
         $(document).unbind('keydown.presentation.navigation');
         $('.toolbutton').not(':first-child, :last-child').toggleClass('hidden');
         $('#present-toggle-button').children('span').text('Present');
         $('#toolbar').removeClass('invisible');
      }
   ); 

   function presentationKeypress(e){
      if( e.which === 32 || e.which === 39 ){
         dizz.next();
      }else if( e.which === 37 ){
         dizz.previous();
      }
   }
   function checkMouseMove(){
      if( mouseMoved === true ){
         mouseMoved = false;
         $('#toolbar').removeClass('invisible');
      }else{
         $('#toolbar').addClass('invisible');
      }
      mouseMovedTimeout = setTimeout( checkMouseMove, mouseInterval );
   }
      
   $('#tool-image').bind('click', function(){
      dizz.savePluginState();
      
      dizz.switchPlugin('nop');
      var overlay = $('#overlay, #overlay-dialog-input');
      overlay.removeClass('hidden');
      
      var insertButton = overlay.find('input[type="button"]');
      insertButton.bind('click', function(){ 
         $(this).unbind('click'); 
         dizz.switchPlugin('editor');
         
         
         
         // local image selected?
         var fileField = $('#image-dialog-file-field');
         var files = fileField[0].files;
         console.trace();
         if( (files.length > 0) && (files[0].type.indexOf('image/') >= 0) ){
            var reader = new FileReader();
            var openFile = files[0];
            reader.onload = function(e){ 
               $(document).trigger( 'addImage', [e.target.result] ); 
            };
            reader.readAsDataURL(openFile);
            fileField.parents('form')[0].reset();
         }else{
            // link image url
            var imageData = overlay.children('#image-dialog-input-field').val();
            if( imageData !== undefined ){
               $(document).trigger( 'addImage', [imageData] ); 
            }
         }
         
         
         
         overlay.addClass('hidden');
         dizz.restorePluginState();
      });

      /*
      var file = evt.target.files; // FileList object
      if ( file.length >= 1 && file[0].type.indexOf('image/') > 0 ) {
         var reader = new FileReader();
         var openFile = file[0];
         reader.onload = function(e){ 
            $(document).trigger( 'addImage', [e.target.result] ); 
         };
         reader.readAsDataURI(openFile);
      }
      */
      
      
   });
   
   
   $('#tool-input-color-fill, #tool-input-color-stroke')
      // stops the bubbling of the keydown/keypress events to the document, where the editor would catch it.
      .bind('keydown keypress', function(e){ e.preventDefault(); return true; } )
      .bind('input', function(e){
         var fillColor = $('#tool-input-color-fill').val();
         var strokeColor = $('#tool-input-color-stroke').val();
         
         $(document).trigger({type : 'dizzy.color.changed', stroke : strokeColor, fill : fillColor } );
         $('.zebraSelected').attr({
            stroke : strokeColor,
            fill : fillColor
         });
      } )
      .bind('click', function(e){ $(this).blur(); });
   /*
    * Menu
    */
   var backupActivePlugin;
   var menuRightDefaultText;
   function toggleMenu(){
      $('#menu').toggleClass('hidden');
      $('#tools-main').toggleClass('expanded');
      
      if( isUndefined(backupActivePlugin) ){
         backupActivePlugin = dizz.activePlugin;
         dizz.switchPlugin('presentation');
      }else{
         dizz.switchPlugin(backupActivePlugin);
         backupActivePlugin = undefined;
      }

      menuRightDefaultText = menuRightDefaultText||$('#menu-right').text();
      $('#menu-right').html(menuRightDefaultText);
   }
   $('#menu-button').bind( 'click', toggleMenu );
       
	/*
	 * Menu-items
    */
   
   $('#menu-left li li').bind('mouseover', function(e){
      var that = $(this);
      var text = that.attr('data-description')||that.attr('title');
      $('#menu-right').text(text);
   });
   
   $('#menu-left li li:not(.inactive)').bind('click', function(e){
      var hidden = $(this).children('div');
      hidden.toggleClass('hidden');
      hidden.bind('click', function(e) { e.stopPropagation(); } ); // prevent event bubbling.
   });
   
   // open
   $('#menu-open-input').bind('change', function(evt){
      var file = evt.target.files; // FileList object
      if ( file.length >= 1 && file[0].type==='image/svg+xml') {
         var reader = new FileReader();
         var openSVGFile = file[0];
         reader.onload = function(e){ 
            dizz.load( e.target.result, function(){
               toggleMenu();
               dizz.switchPlugin('editor');
            });
         };
         reader.readAsText(openSVGFile);
      }
   });
   
   $('#menu-save').bind('click', function(evt){
      dizz.switchPlugin('presentation');
      var svgProlog = '<?xml version="1.0" encoding="UTF-8"?>';

      var svgText = dizz.serialize();
      var svgBase64 = 'data:image/svg+xml;charset=utf-8;base64,'+$.base64Encode (svgText);
      window.open(svgBase64);
   });
   
   // style -> css
   var cssInput = $('#menu-style-css-input');
   cssInput.bind('input blur', function(evt){
      $('#dizzy-internal-style').empty();
      $('#dizzy-internal-style').append( cssInput.val() );
   });
   
   
   
   
   $('#zebra-expand-button').bind('click', function(){
      $('#zebra-toolbar').toggleClass('hidden');
      $(this).toggleClass('mirrored');
   });
   
   
   /*
    * Overlay
    */
   $('.overlay-close, .overlay-cancel').bind('click', function(){
      $('#overlay').addClass('hidden');
      dizz.switchPlugin('editor');
   });
   
   
	
});
