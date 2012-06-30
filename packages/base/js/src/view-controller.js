var ViewController = Layout.extend();
_.extend(ViewController.prototype, Router.prototype, {
  initialize: function() {
    this.on('route:before', this._onBeforeRoute, this);
    Backbone.history.on('route', this._onRoute, this);
    this.on('destroy', function() {
      Backbone.history.off('route', this._onRoute, this);
    });
    this._bindRoutes();
  },
  route: function(route, name, callback) {
    //wrap the route callback (route event is too late)
    //and set the view controller as the view on the
    //parent if parent was set
    return Router.prototype.route.call(this, route, name, function() {
      this.trigger.apply(this, ['route:before', name].concat(Array.prototype.slice.call(arguments)));
      return callback.apply(this, arguments);
    });
  },
  _onBeforeRoute: function(router, name) {
    if (this.parent) {
      if (this.parent.getView() !== this) {
        this.parent.setView(this);
      }
    }
  },
  _onRoute: function(router, name) {
    if (this === router) {
      this.trigger.apply(this, ['route'].concat(Array.prototype.slice.call(arguments, 1)));
    }
  }
});
