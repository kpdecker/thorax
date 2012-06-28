module.router({
  index: function() {
    Application.setView('docs/index');
  },
  loading: function() {
    Application.setView('docs/loading');
  },
  form: function() {
    Application.setView('docs/form');
  },
  mobile: function() {
    Application.setView('docs/mobile');
  },
  start: function() {
    Application.setView('docs/start');
  },
  examples: function() {
    Application.setView('docs/examples');
  }
});
