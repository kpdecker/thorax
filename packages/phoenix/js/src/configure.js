var Thorax;
this.Thorax = Thorax = {
  configure: function(options) {
    scope = (options && options.scope) || (typeof exports !== 'undefined' && exports);
  
    if (!scope) {
      scope = outerScope.Application = {};
    }
  
    _.extend(scope, Backbone.Events, Thorax.registry);
  
    Thorax.templatePathPrefix = options && typeof options.templatePathPrefix !== 'undefined' ? options.templatePathPrefix : '';
    
    Backbone.history || (Backbone.history = new Backbone.History);
  
    scope.layout = new Thorax.Layout({
      el: options && options.layout || '.layout'
    });
  }
};

Thorax._currentTemplateContext = false;