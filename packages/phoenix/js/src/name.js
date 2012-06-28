//if a "name" property is specified during extend set it on the registry
//views need special property inheritence
//routers will be treated as initialized singletons
_.each({
  Model: 'model',
  Collection: 'collection',
  View: 'view',
  Router: 'router'
}, function(registryMethodName, className) {
  $super = Thorax[className].extend;
  Thorax[className].extend = function(protoProps, classProps) {
    var child = $super.call(this, protoProps, classProps);
    if (child.prototype.name) {
      Thorax.registry[registryMethodName](child.prototype.name, className === 'Router' ? new child : child);
    }
    return child;
  };
});
