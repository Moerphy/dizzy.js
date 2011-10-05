/*
 * The Sandbox provides subscribe/notify service for modules to communicate with each other.
 * Also does relay some calls to the Application core (not yet, but probably will be necessary any time)
 */
define(function(){
  var subscriptions = {
    handler: [],
    children: {}
  };
  var deferredMessages = []; // TODO

  var sandbox = function () {};


  function addSubscription(sub, handler) {
    var subscriptionObj = subscriptions;
    var subNamespace = sub.split('.');

    for (var i = 0; i < subNamespace.length; ++i) {
      var namePart = subNamespace[i];
      // traverse down in subscriptiontree
      subscriptionObj = subscriptionObj.children;

      if (subscriptionObj[namePart] === undefined) {
        subscriptionObj[namePart] = {
          handler: [],
          children: {}
        }; // add new handler/children combination
      }
      subscriptionObj = subscriptionObj[subNamespace[i]];
    }
    subscriptionObj.handler.push(handler);
  }


  function getSubscriptions(sub) {
    var subscriptionObj = subscriptions;
    var subNamespace = sub.split('.');

    var handlers = [];
    var push = handlers.push;
    for (var i = 0; i < subNamespace.length && subscriptionObj.children[subNamespace[i]] !== undefined; ++i) {
      // add all the handlers from the namespaces above
      push.apply(handlers, subscriptionObj.handler);
      subscriptionObj = subscriptionObj.children[subNamespace[i]];
    }
    push.apply(handlers, subscriptionObj.handler);

    return handlers;
  }


  sandbox.prototype = {

    subscribe: function (name, handler) {
      addSubscription(name, handler);
    },

    /*
    unsubscribe : function( id ){
       
    },
    */

    publish: function (name, data) {
      data = data || {};

      var handlers = getSubscriptions(name);
      for (var i = 0; i < handlers.length; ++i) {
        handlers[i].call(null, data, name);
      }
    }

  };
  return new sandbox();
});
