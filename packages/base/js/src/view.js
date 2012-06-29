//Backbone.View constructor doesn't provide everything we need
//so create a new one
var _viewsIndexedByCid = {};
var View = function(options) {
  this.cid = _.uniqueId('view');
  _viewsIndexedByCid[this.cid] = this;
  this._boundCollectionsByCid = {};
  this._views = {};
  this._partials = {};
  this._renderCount = 0;
  this._configure(options || {});
  this._ensureElement();
  this.delegateEvents();
  this.trigger('initialize:before', options);
  this.initialize.apply(this, arguments);
  this.trigger('initialize:after', options);
};

View.extend = function() {
  var child = Backbone.View.extend.apply(this, arguments);
  child.mixins = _.clone(this.mixins);
  cloneEvents(this, child, 'events');
  cloneEvents(this.events, child.events, 'model');
  cloneEvents(this.events, child.events, 'collection');
  child.instance = (function() {
    var instance;
    return function(options) {
      if (!instance) {
        instance = new child(options);
      } else if (options) {
        _.extend(instance, options);
        if (options.model) {
          instance.setModel(model);
        }
      }
      return instance;
    };
  })();
  return child;
};

View.create = function(options) {
  return new this(options);
};

function cloneEvents(source, target, key) {
  source[key] = _.clone(target[key]);
  //need to deep clone events array
  _.each(source[key], function(value, _key) {
    if (_.isArray(value)) {
      target[key][_key] = _.clone(value);
    }
  });
}

_.extend(View.prototype, Backbone.View.prototype, {
  _configure: function(options) {
    //this.options is removed in Thorax.View, we merge passed
    //properties directly with the view and template context
    _.extend(this, options || {});

    //compile a string if it is set as this.template
    if (typeof this.template === 'string') {
      this.template = Handlebars.compile(this.template);
    } else if (this.name) {
      //fetch the template 
      this.template = Thorax.registry.template(this.name, null, true);
    }
        
    //will be called again by Backbone.View(), after _configure() is complete but safe to call twice
    this._ensureElement();

    //model and collection events
    bindModelAndCollectionEvents.call(this, this.constructor.events);
    if (this.events) {
      bindModelAndCollectionEvents.call(this, this.events);
    }

    //mixins
    for (var i = 0; i < this.constructor.mixins.length; ++i) {
      applyMixin.call(this, this.constructor.mixins[i]);
    }
    if (this.mixins) {
      for (var i = 0; i < this.mixins.length; ++i) {
        applyMixin.call(this, this.mixins[i]);
      }
    }
  },

  _ensureElement : function() {
    Backbone.View.prototype._ensureElement.call(this);
    (this.el[0] || this.el).setAttribute(viewNameAttributeName, this.name || this.cid);
    (this.el[0] || this.el).setAttribute(viewCidAttributeName, this.cid);      
  },

  _shouldFetch: function(model_or_collection, options) {
    var url = (
      (!model_or_collection.collection && getValue(model_or_collection, 'urlRoot')) ||
      (model_or_collection.collection && getValue(model_or_collection.collection, 'url')) ||
      (!model_or_collection.collection && model_or_collection._byCid && model_or_collection._byId && getValue(model_or_collection, 'url'))
    );
    return url && options.fetch && (
      typeof model_or_collection.isPopulated === 'undefined' || !model_or_collection.isPopulated()
    );
  },

  destroy: function() {
    this.freeze();
    this.trigger('destroyed');
    this.off();
    this._events = {};
    this._boundCollectionsByCid = {};
    this.el = null;
    this.collection = null;
    this.model = null;
    delete _viewsIndexedByCid[this.cid];
    //destroy child views
    for (var id in this._views || {}) {
      if (this._views[id].destroy) {
        this._views[id].destroy();
      }
      this._views[id] = null;
    }
  }
});
