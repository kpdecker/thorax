var Application = ViewController.extend({
  name: 'application',
  initialize: function(options) {
    //ensure backbone history has started
    Backbone.history || (Backbone.history = new Backbone.History);

    //"template" method has special meaning on application object
    //as it is a registry provider
    if (this.template != Application.prototype.template) {
      this._template = this.template;
      this.template = Application.prototype.template;
      if (typeof this._template === 'string') {
        this._template = Handlebars.compile(this._template);
      }
    }
    this.template = Application.prototype.template;

    _.extend(this, options || {}, {
      Layout: Layout.extend({}),
      View: View.extend({}),
      Model: Model.extend({}),
      Collection: Collection.extend({}),
      Router: Router.extend({}),
      ViewController: ViewController.extend({})
    });
  },
  //model also has special meaning to the Application object
  //don't bind it as it is the registry function
  setModel:function(){},
  render: generateRenderLayout('_template'),
  start: function(options) {
    //if this is a lumbar app, setup the module loader
    this.initBackboneLoader && this.initBackboneLoader();
    //application and other templates included by the base
    //application may want to use the link and url helpers
    //which use hasPushstate, etc. so setup history, then
    //render, then dispatch
    if (!Backbone.History.started) {
      Backbone.history.start(_.extend({
        silent: true
      }, options || {}));
    }
    this.render();
    this.trigger('ready', options);
    Backbone.history.loadUrl();
  }
});
