Application.Router.extend({
  name: module.name,
  routes: module.routes,
  index: function() {
    var view = this.view('docs/index');
    Application.setView(view);
  },
  loading: function() {
    var view = this.view('docs/loading');
    Application.setView(view);
  },
  form: function() {
    var view = this.view('docs/form');
    Application.setView(view);
  },
  mobile: function() {
    var view = this.view('docs/mobile');
    Application.setView(view);
  },
  start: function() {
    var view = this.view('docs/start');
    Application.setView(view);
  },
  examples: function() {
    var view = this.view('docs/examples');
    Application.setView(view);
  }
})
