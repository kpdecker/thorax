var Application = Layout.extend({
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
    this.render();
    if (!Backbone.History.started) {
      Backbone.history.start(options);
    }
    this.trigger('ready', options);
  }
});
