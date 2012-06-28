var viewTemplateOverrides = {};
View.registerHelper('view', function(view, options) {
  if (!view) {
    return '';
  }
  var instance = getViewInstance(view, options ? options.hash : {}),
      placeholder_id = instance.cid + '-' + _.uniqueId('placeholder');
  this._view._views[instance.cid] = instance;
  if (options.fn) {
    viewTemplateOverrides[placeholder_id] = options.fn;
  }
  var htmlAttributes = View.htmlAttributesFromOptions(options.hash);
  htmlAttributes[viewPlaceholderAttributeName] = placeholder_id;
  return new Handlebars.SafeString(View.tag.call(this, htmlAttributes));
});

function getViewInstance(name, attributes) {
  if (typeof name === 'string') {
    return new (Thorax.registry.view(name))(attributes);
  } else if (typeof name === 'function') {
    return new name(attributes);
  } else {
    return name;
  }
}

//called from View.prototype.html()
function appendViews(scope) {
  if (!this._views) {
    return;
  }
  _.toArray($(scope || this.el).find('[' + viewPlaceholderAttributeName + ']')).forEach(function(el) {
    var placeholder_id = el.getAttribute(viewPlaceholderAttributeName),
        cid = placeholder_id.replace(/\-placeholder\d+$/, ''),
        view = this._views[cid];
    if (view) {
      //see if the {{#view}} helper declared an override for the view
      //if not, ensure the view has been rendered at least once
      if (viewTemplateOverrides[placeholder_id]) {
        view.render(viewTemplateOverrides[placeholder_id](getTemplateContext.call(view)));
      } else {
        ensureRendered.call(view);
      }
      el.parentNode.insertBefore(view.el, el);
      el.parentNode.removeChild(el);
    }
  }, this);
}

