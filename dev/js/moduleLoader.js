/**
 * Registers all modules that are listed in modules.js at the application core.
 */
require(['application', 'modules'], function(app, mods){
  for( var i = 0; i < mods.length; i++ ){
    if( mods[i] ){
      app.registerModule( mods[i] );
    }
  }
});

