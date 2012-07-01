var ViewController = Layout.extend();
_.extend(ViewController.prototype, Router.prototype, {
  initialize: function() {
    Router.prototype.initialize.call(this);
    //set the ViewController as the view on the parent
    //if a parent was specified
    this.on('route:before', function(router, name) {
      if (this.parent) {
        if (this.parent.getView() !== this) {
          this.parent.setView(this, {
            destroy: false
          });
        }
      }
    }, this);
    this._bindRoutes();
  }
});
