Thorax.registry = {
  templates: {},
  Views: {},
  Mixins: {},
  Models: {},
  Collections: {},
  Routers: {}
};

_.each({
  view: 'Views',
  model: 'Models',
  collection: 'Collections',
  template: 'templates',
  router: 'Routers'
}, function(registryName, methodName) {
  var registry = Thorax.registry[registryName];
  Thorax.registry[methodName] = function(name, value, ignoreErrors) {
    if (methodName === 'template') {
      //append templatePathPrefix if getting
      if (!value) {
        name = Thorax.templatePathPrefix + name;
      }
      //always remove handlebars extension wether setting or getting
      name = name.replace(handlebarsExtensionRegExp, '')
    }
    if (!value) {
      if (!registry[name] && !ignoreErrors) {
        throw new Error(methodName + ': ' + name + ' does not exist.');
      }
      return registry[name];
    } else {
      if (methodName === 'template' && typeof value === 'string') {
        return registry[name] = Handlebars.compile(value);
      } else {
        return registry[name] = value;
      }
    }
  };
});

Thorax.registry.view('application', Application);

_.each({
  view: 'View',
  model: 'Model',
  collection: 'Collection',
  router: 'Router'
}, function(className, methodName) {
  Application.prototype[methodName] = function(name, protoProps, classProps) {
    var _name = String(name);
    if (arguments.length === 1) {
      return Thorax.registry[methodName](name);
    } else {
      var existing = Thorax.registry[methodName](name, null, true);
      if (!existing) {
        if (protoProps.prototype) {
          protoProps.prototype.name = name;
          return Thorax.registry[methodName](name, className === 'Router' ? new protoProps : protoProps);
        } else if (protoProps.cid) {
          if (!protoProps.name) {
            protoProps.name = name;
          }
          return Thorax.registry[methodName](name, protoProps);
        } else {
          protoProps.name = name;
          var klass = this[className].extend(protoProps, classProps);
          return Thorax.registry[methodName](name, className === 'Router' ? new klass : klass);
        }
      } else {
        if (protoProps.prototype) {
          existing = protoProps;
          Thorax.registry[methodName](name, existing);
        } else if (protoProps) {
          _.extend(existing.prototype, protoProps);
        }
        if (classProps) {
          _.extend(exisitng, classProps);
        }
        return existing;
      }
    }
  };
}, this);

Application.prototype.template = Thorax.registry.template;

Thorax.addModuleMethods = function(module, application) {
  module.router = function(protoProps) {
    var router = Thorax.registry.router(module.name, null, true);
    if (arguments.length === 0) {
      return router;
    }
    if (!router) {
      if (protoProps.prototype) {
        protoProps.prototype.name = module.name;
        protoProps.prototype.routes = module.routes;
        protoProps = new protoProps;
      } else {
        protoProps.name = module.name;
        protoProps.routes = module.routes;
      }
      return application.router(module.name, protoProps);
    } else {
      _.extend(router, protoProps);
      return router;
    }
  };
};
