
/*
 * Just in case there is no window.console defined, put an empty function there. 
 * This way I can use it without getting errors in browsers that don't have console enabled (eg. firefox without firebug)
 */
(function(){
   
   if (!window.console){
      var names = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml", "group", "groupEnd", "time", "timeEnd", "count", "trace", "profile", "profileEnd"];


      window.console = {};
      var dummy = function(){};
      for (var i = 0; i < names.length; ++i){
         window.console[names[i]] = dummy;
      }
   }
   
})();
