Application.View.extend({
  name: 'docs/form',
  events: {
    'submit form': function(event) {
      this.success = false;
      this.serialize(event, function(attributes, release) {
        this.success = 'heya';
        this.render();
      });
    }
  }
});
