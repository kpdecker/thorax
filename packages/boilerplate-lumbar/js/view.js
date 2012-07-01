[
  Application.View,
  Application.ViewController,
  Application.Layout
].forEach(function(klass) {
  _.extend(klass.prototype, {
    //your instance methods here
  });
});
