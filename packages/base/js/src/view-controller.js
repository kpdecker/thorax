var ViewController = Layout.extend();
_.extend(ViewController.prototype, Router.prototype, {
  initialize: function() {
    Backbone.history.on('route', this._onRoute, this);
    this.on('destroy', function() {
      Backbone.history.off('route', this._onRoute, this);
    });
    this._bindRoutes();
  },
  _onRoute: function(router, name) {
    if (router === this) {
      if (this.parent) {
        if (this.parent.getView() !== this) {
          this.parent.setView(this);
        }
      }
      this.trigger.apply(this, ['route'].concat(Array.prototype.slice.call(arguments, 1)));
    }
  }
});
