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
         $('.toolbutton').not('.fullwidth').toggleClass('hidden');
         $('#present-toggle-button').children('span').text('End'); 
      },
      function(){ 
         dizz.switchPlugin('editor');
         clearTimeout( mouseMovedTimeout );
         selectButton($('#tool-default'));
         $(document).unbind('keydown.presentation.navigation');
         $('.toolbutton').not('.fullwidth').toggleClass('hidden');
         $('#present-toggle-button').children('span').text('Present');
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
      
      var insertButton = overlay.children('input[type="button"]');
      insertButton.bind('click', function(){ 
         $(this).unbind('click'); 
         
         dizz.switchPlugin('editor');
         
         $(document).trigger( 'addImage', [overlay.children('#overlay-dialog-input-field').val()] ); 
         
         overlay.addClass('hidden');
         dizz.restorePluginState();
      });
      
     // dizz.addImage();
   });
      
      
      
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
      }else{
         dizz.switchPlugin(backupActivePlugin);
         backupActivePlugin = undefined;
      }

      menuRightDefaultText = menuRightDefaultText||$('#menu-right').text();
      $('#menu-right').html(menuRightDefaultText);
   }
   $('#menu-button').bind('click', function() {
      toggleMenu();
   });
       
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
      dizz.switchPlugin(presentation);
      var svgProlog = '<?xml version="1.0" encoding="UTF-8"?>';

      var svgText = dizz.serialize();
      var svgBase64 = 'data:image/svg+xml;charset=utf-8;base64,'+$.base64Encode (svgText);
      window.open(svgBase64);
   });
   
   // style -> css
   var cssInput = $('#menu-style-css-input');
   cssInput.bind('blur', function(evt){
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
   $('.overlay-close').bind('click', function(){
      $('#overlay').addClass('hidden');
      dizz.switchPlugin('editor');
   });
   
   
	
});
