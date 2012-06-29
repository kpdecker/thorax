var Model = Backbone.Model.extend({
  isEmpty: function() {
    return this.isPopulated();
  },
  isPopulated: function() {
    // We are populated if we have attributes set
    var attributes = _.clone(this.attributes);
    var defaults = _.isFunction(this.defaults) ? this.defaults() : (this.defaults || {});
    for (var default_key in defaults) {
      if (attributes[default_key] != defaults[default_key]) {
        return true;
      }
      delete attributes[default_key];
    }
    var keys = _.keys(attributes);
    return keys.length > 1 || (keys.length === 1 && keys[0] !== 'id');
  }
}, {
  create: function(options) {
    return new this(options);
  }
});

Model.extend = function() {
  var child = Backbone.Model.extend.apply(this, arguments);
  child.instance = (function() {
    var instance;
    return function(options) {
      if (!instance) {
        instance = new child(options);
      } else if (options) {
        instance.set(options);
      }
      return instance;
    };
  })();
  return child;
};
