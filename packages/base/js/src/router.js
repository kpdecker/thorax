var Router = Backbone.Router.extend({
  initialize: function() {
    Backbone.history.on('route', onRoute, this);
    this.on('destroy', function() {
      Backbone.history.off('route', onRoute, this);
    });
  },
  route: function(route, name, callback) {
    //add a route:before event that is fired before the callback is called
    return Backbone.Router.prototype.route.call(this, route, name, function() {
      this.trigger.apply(this, ['route:before', name].concat(Array.prototype.slice.call(arguments)));
      return callback.apply(this, arguments);
    });
  }
});

function onRoute(router, name) {
  if (this === router) {
    this.trigger.apply(this, ['route'].concat(Array.prototype.slice.call(arguments, 1)));
  }
}
