/**
 * Loads up all modules and kicks off the application.
 */
define(['./libs/jquery.js', './libs/util.js', 'application', 'moduleLoader'], function(jq, util, application, modules){ // NOTE: jq and util will undefined. 
  $(function(){
    application.startAll();
  });
});
