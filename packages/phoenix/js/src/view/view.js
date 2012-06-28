Thorax.View.prototype.view = function(name, options) {
  var instance = getViewInstance(name, options);
  this._views[instance.cid] = instance;
  return instance;
};
