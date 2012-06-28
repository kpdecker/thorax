Application.View.extend({
  name: 'docs/loading',
  test: function() {
    console.log(this, arguments);
    return 'oh yeah';
  }
});
