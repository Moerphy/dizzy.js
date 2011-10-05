define(['sandbox'], function(sandbox){
  return {    
     init : function(){
        $(document).bind('mousewheel', function(e, delta){ // mousewheel support for scrolling in canvas
           var scrollUp = (delta < 0);
           var eventSuffix = scrollUp?'up':'down';
           console.log('Publishing mousewheel with delta: '+delta);
           
           sandbox.publish('dizzy.io.mouse.wheel.'+eventSuffix, { 'delta' : delta, event: e } );
        });
        

     },
     destroy : function(){
        $(document).unbind('mousewheel');
     }
  };
 });
