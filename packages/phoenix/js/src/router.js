Router.prototype.setView = function() {
  return scope.layout.setView.apply(scope.layout, arguments);
};

Router.create = function(module, protoProps, classProps) {
  return scope.Routers[module.name] = new (this.extend(_.extend({}, module, protoProps), classProps));
};