internalViewEvents.model = {
  error: function(model, errors){
    if (this._modelOptions.errors) {
      this.trigger('error', errors);
    }
  },
  change: function() {
    this._onModelChange();
  }
};

_.extend(View.prototype, {
  setModel: function(model, options) {
    var oldModel = this.model;

    if (oldModel) {
      this._events.model.forEach(function(event) {
        oldModel.off(event[0], event[1]);
      }, this);
    }

    if (model) {
      this.$el.attr(modelCidAttributeName, model.cid);
      if (model.name) {
        this.$el.attr(modelNameAttributeName, model.name);
      }
      this.model = model;
      this.setModelOptions(options);
      if (this._frozen) {
        return this;
      }
      this._events.model.forEach(function(event) {
        this.model.on(event[0], event[1]);
      }, this);

      this.model.trigger('set', this.model, oldModel);
  
      if (this._shouldFetch(this.model, this._modelOptions)) {
        var success = this._modelOptions.success;
        this._loadModel(this.model, this._modelOptions);
      } else {
        //want to trigger built in event handler (render() + populate())
        //without triggering event on model
        this._onModelChange();
      }
    } else {
      this._modelOptions = false;
      this.model = false;
      this._onModelChange();
      this.$el.removeAttr(modelCidAttributeName);
      this.$el.attr(modelNameAttributeName);
    }

    return this;
  },

  _onModelChange: function() {
    if (!this._modelOptions || (this._modelOptions && this._modelOptions.render)) {
      this.render();
    }
  },

  _loadModel: function(model, options) {
    model.fetch(options);
  },

  setModelOptions: function(options) {
    if (!this._modelOptions) {
      this._modelOptions = {
        fetch: true,
        success: false,
        render: true,
        populate: true,
        errors: true
      };
    }
    _.extend(this._modelOptions, options || {});
    return this._modelOptions;
  }
});
