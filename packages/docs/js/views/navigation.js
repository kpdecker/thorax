Application.view('navigation', {
  initialize: function() {
    Backbone.history.bind('route', _.bind(function(router, path) {
      var regexp = new RegExp('\#?\/' + (path.match(/index$/) ? '' : path))
      this.$('.active').removeClass('active');
      $(_.find(this.$('li a'), function(item) {
        return item.getAttribute('href').match(regexp);
      })).closest('li').addClass('active');
    }, this));
  }
});