/*
 * editor.ui of dizzy.js 
 * http://dizzy.metafnord.org
 * 
 * Date: 04/05/2011
 * 
 * licensed under the terms of the MIT License
 * http://www.opensource.org/licenses/mit-license.html
 */

$(function(){
	$('#dizzy').height($(document).height());
	$('#dizzy').width($(document).width());
	
	var dizz = new Dizzy('#dizzy', {zoomable: true, pannable: true, transformTime: 1000, zoomFactor: 2} );
		
	loadPresentation('./svg/blank.svg');
	
	function loadPresentation(uri){
		
		dizz.load(uri, 
			function(){ 
				dizz.show(0);
				dizz.editor(true);
			} );
	}
	var toolbar = $('#toolbar');
	/*
	 * menubar effects
	 */ 
	var inBar = false;
	var bar = $('#menubar');

	bar.bind( {
			mouseenter: (function(ev){ inBar = true; setTimeout(showHideMenuBar, 500 ); }),
			mouseleave: (function(ev){ inBar = false;setTimeout(showHideMenuBar, 500 ); })
			}
	);
	function showHideMenuBar(){
		var menuHeight = 40;
		if( inBar === false ){
			menuHeight = 10;
	 	}
		bar.animate({height:menuHeight+'px' }, 500);
	}
	

	/*
	 * Menubar event handlers
	 */
	/*
	 * Save
	 */
	$('#saveButton').bind('click', 
		function(){ 
			var svgProlog = '<?xml version="1.0" encoding="UTF-8"?>';
		
			var svgText = dizz.serialize();
			var svgBase64 = 'data:image/svg+xml;charset=utf-8;base64,'+$.base64Encode (svgText);
			window.open(svgBase64);
		});
	/*
	 * Present/Edit
	 */
	$('#presentToggleButton').toggle(
		function(){ 
			dizz.editor(false); 
			toolbar.hide();
			$('#presentToggleText').text('Edit'); 
			$('#leftrightButtons').fadeToggle('slow'); 
		},
		function(){ 
			dizz.editor(true); 
			toolbar.show();
			$('#presentToggleText').text('Present'); 
			$('#leftrightButtons').fadeToggle('slow'); 
		}
	);
	
	/*
	 * Help
	 */
	var dialogWidth = $(document).width()/2;
	var maxH = $(document).height()*0.5;
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
	 * Open (does not work currently)
	 */
	var openSVGFile;
	$('#openButton').click( function(){
		if ( window.File && window.FileReader ) {
			$('#openfileDialog').dialog('open');
		}else{
			alert("Sorry, your browser does not support the File API. ): \n\r Try using Firefox 3.6 or Google Chrome 8 or higher.")
		}
	});	
	
	
	$('#openfileDialog').dialog({
		autoOpen: false,
		modal: true,
		width: dialogWidth,
		buttons: {
			Open: (function() {
				if( openSVGFile !== undefined ){
					this.value = '';
				    var reader = new FileReader();
				    reader.onload = function(e) { 
						dizz.load( e.target.result, function(){
							dizz.editor(true);
						});
				    };
				    reader.readAsText(openSVGFile);
				}
				$( this ).dialog( "close" );
			}),
			Cancel: (function() {
				$( this ).dialog( "close" );
			})
		}
	});
	
	
	$('#fileInput').bind('change', 
		function(evt){
			var file = evt.target.files; // FileList object
			if ( file.length >= 1 && file[0].type==='image/svg+xml') {
				openSVGFile = file[0];
		    }else{
		    	openSVGFile = undefined;	
		    }
	});


	/*
	 * Toolbar
	 */
	
	var inToolbar = false;
	toolbar.bind({
		mouseenter: function(e){
			inToolbar = true;
			setTimeout( showHideToolbar, 350 );
		},
		mouseleave: function(e){
			inToolbar = false;
			setTimeout( showHideToolbar, 350 );
		}
	});

	function showHideToolbar(){
		var toolWidth = 40;
		if( inToolbar === false ){
			toolWidth = 10;
	 	}
		toolbar.animate({width:toolWidth+'px' }, 500);
	}
	
	/*
	 * Editor defaultmode
	 */
	$('#defaultTool').click( function(e){ 
		dizz.editorDefaultMode(true); 
		$(this).siblings().css('opacity', '1');
		$(this).css('opacity', '0.7');
	} );
	/*
	 * Editor pathmode
	 */
	$('#pathTool').click( function(e){ 
		dizz.editorPathMode(true); 
		$(this).siblings().css('opacity', '1');
		$(this).css('opacity', '0.7');
	} );
	/*
	 * Present-mode buttons
	 */
	// next
	$('#left').click( function(){ dizz.previous(); } );
	// previous
	$('#right').click( function(){ dizz.next(); } );
});
