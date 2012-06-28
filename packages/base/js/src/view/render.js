_.extend(View.prototype, {
  render: function(output) {
    destroyPartials.call(this);
    if (typeof output === 'undefined' || (!_.isElement(output) && !is$(output) && !(output && output.el) && typeof output !== 'string' && typeof output !== 'function')) {
      if (!this.template) {
        throw new Error('View ' + (this.name || this.cid) + '.render() was called with no content and no template set on the view.');
      }
      output = this.renderTemplate(this.template, this._getContext(this.model));
    } else if (typeof output === 'function') {
      output = this.renderTemplate(output, this._getContext(this.model));
    }
    //accept a view, string, Handlebars.SafeString or DOM element
    this.html((output && output.el) || (output && output.string) || output);
    ++this._renderCount;
    this.trigger('rendered');
    return output;
  },

  context: function(model) {
    return model ? model.attributes : {};
  },

  _getContext: function(model) {
    if (typeof this.context === 'function') {
      return this.context(model);
    } else {
      var context = _.extend({}, (model && model.attributes) || {});
      _.each(this.context, function(value, key) {
        context[key] = value;
      }, this);
      return context;
    }
  },

  renderTemplate: function(file, data, ignoreErrors) {
    var template;
    data = getTemplateContext.call(this, data);
    if (typeof file === 'function') {
      template = file;
    } else {
      template = this._loadTemplate(file);
    }
    if (!template) {
      if (ignoreErrors) {
        return ''
      } else {
        throw new Error('Unable to find template ' + file);
      }
    } else {
      return template(data);
    }
  },

  _loadTemplate: function(file, ignoreErrors) {
    return Thorax.registry.template(file, null, ignoreErrors);
  },

  html: function(html) {
    if (typeof html === 'undefined') {
      return this.el.innerHTML;
    } else {
      var element = this.$el.html(html);
      //TODO: find better solution for problem of partials embedding views embedding partials embedding....
      appendPartials.call(this);
      appendViews.call(this);
      appendPartials.call(this);
      return element;
    }
  }
});

function ensureRendered() {
  !this._renderCount && this.render();
}

function getTemplateContext(data) {
  return _.extend({}, this, data || {}, {
    cid: _.uniqueId('t'),
    _view: this
  });
}
