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
				dizz.show(0);
				dizz.editor(true);
            // load default css in edit-box
            $('#menu-style-css-input').val( $('#dizzy-internal-style').text() );
			} );
	}
	var toolbar = $('#toolbar');

	

	/*
	 * Menubar event handlers
	 */
	/*
	 * Help
	 */
	var dialogWidth = $(document).width()/2;
	var maxH = $(document).height()/2;
	$('#helpDialog').dialog({autoOpen: false, modal:true, width: dialogWidth, height: maxH, maxHeight: maxH});
	$('#helpButton').bind('click', 
		function(){
		$('#helpDialog').dialog('open');
		}
	);
	
	/*
	 * About
	 */
	$('#aboutDialog').dialog({autoOpen: false, modal:true, width: dialogWidth, height: maxH, maxHeight: maxH});
	$('#aboutButton').bind('click', 
		function(){
			$('#aboutDialog').dialog('open');

		}
	);
	
      
   /*
    * Toolbar
    */
   function selectButton(node){
      $(node).siblings().removeClass('pressed');
		$(node).addClass('pressed');
      dizz.hideZebra();
   }
   $('#tool-default').click( function(e){ 
		dizz.editorDefaultMode(true); 
		selectButton(this);
	} );
   $('#tool-path').click( function(e){ 
		dizz.editorPathMode(true); 
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
      
   $('#present-toggle-button').toggle(
		function(){ 
         dizz.editor(false); 
         $('.toolbutton').not('.fullwidth').toggleClass('hidden');
			$('#present-toggle-button').children('span').text('End'); 
		},
		function(){ 
			dizz.editor(true); 
         selectButton($('#tool-default'));
			$('.toolbutton').not('.fullwidth').toggleClass('hidden');
			$('#present-toggle-button').children('span').text('Present');
		}
	); 
      
      
      
   /*
    * Menu
    */
   var menuRightDefaultText;
   function toggleMenu(){
      $('#menu').toggleClass('hidden');
      $('#tools-main').toggleClass('expanded');
      dizz.editor(!dizz.isEditing());
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
               dizz.editor(true);
               toggleMenu();
            });
         };
         reader.readAsText(openSVGFile);
      }
   });
   
   $('#menu-save').bind('click', function(evt){
      dizz.editor(false);
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
   
   
   
   

	
});
