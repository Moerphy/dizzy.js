/*
 * The rect mode allows to draw a rect on the canvas. Can be used to frame something (visible or invisible).
 */

define(['sandbox'],  function(sandbox){
      var canvas;
      
      var ready = false;
      // the complete textfield overlay, including buttons
      var viewportRect;
      var svgRect;
      var  active = false;
      var editing = false;
      
      var textMode = {
        
         depends : [],
         
         start : function(){
            active = true;
            
            viewportRect = $('<div id="debugrect" />');
            $('#container').append(viewportRect);
            
            svgRect = canvas.svg.rect( 0, 0, 100, 100, { stroke: 'blue', fill: 'none'  } );
            //canvas.createGroup().dom().append(svgRect);
            $(canvas.svg.root())/*.find('#canvas')*/.append(svgRect);
         },
         
         stop : function(){
            active = false;
         }
            
         
      };
      
      
      sandbox.publish('dizzy.modes.register', { name : 'tool-rect', instance : textMode } );
      
      sandbox.subscribe( 'dizzy.canvas.io.mouse.click', function(e){
         if( active ){
            e.preventDefault();
            e.stopPropagation();
            var coords = {
               x: e.pageX,
               y: e.pageY
            };
            var svgOffset =  canvas.toViewboxCoordinates( coords );
            /*
            svgOffset.x = canvas.WIDTH/2;
            svgOffset.y = canvas.HEIGHT/2;
            //*/
            
            
            $(svgRect).attr({
               x : svgOffset.x,
               y : svgOffset.y
            });
            
            var viewportCoords =  canvas.toViewboxCoordinates( svgOffset, true );
            $(viewportRect).css({
               left : viewportCoords.x,
               top : viewportCoords.y
            });
         }
      });
      
    
      
      sandbox.subscribe( 'dizzy.presentation.loaded', function(c){
         canvas = c.canvas;
         ready = true;
      });
      
     
      
      sandbox.subscribe( 'dizzy.presentation.transformed', function(){
         //resetInput();
      });
      
   });
