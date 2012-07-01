function generateRenderLayout(templateAttributeName) {
  templateAttributeName = templateAttributeName || 'template';
  return function(output) {
    //TODO: fixme, lumbar inserts templates after JS, most of the time this is fine
    //but Application will be created in init.js (unlike most views)
    //so need to put this here so the template will be picked up
    var layoutTemplate;
    if (this.name) {
      layoutTemplate = Thorax.registry.template(this.name, null, true);
    }
    //a template is optional in a layout
    if (output || this[templateAttributeName] || layoutTemplate) {
      //but if present, it must have embedded an element containing layoutCidAttributeName 
      var response = View.prototype.render.call(this, output || this[templateAttributeName] || layoutTemplate);
      ensureLayoutViewsTargetElement.call(this);
      return response;
    } else {
      ensureLayoutCid.call(this);
    }
  }
}

var Layout = View.extend({
  render: generateRenderLayout(),
  setView: function(view, options) {
    options = _.extend({
      scroll: true,
      destroy: true
    }, options || {});
    if (typeof view === 'string') {
      view = new (Thorax.registry.view(view));
    }
    ensureRendered.call(this);
    var old_view = this._view;
    if (view == old_view){
      return false;
    }
    if (options.destroy) {
      view._shouldDestroyOnNextSetView = true;
    }
    this.trigger('change:view:start', view, old_view, options);
    old_view && old_view.trigger('deactivated', options);
    view && view.trigger('activated', options);
    if (old_view && old_view.el && old_view.el.parentNode) {
      old_view.$el.remove();
    }
    //make sure the view has been rendered at least once
    view && ensureRendered.call(view);
    view && getLayoutViewsTargetElement.call(this).appendChild(view.el);
    options.scroll && window.scrollTo(0, minimumScrollYOffset);
    this._view = view;
    old_view && old_view._shouldDestroyOnNextSetView && old_view.destroy();
    this._view && this._view.trigger('ready', options);
    this.trigger('change:view:end', view, old_view, options);
    return view;
  },

  getView: function() {
    return this._view;
  }
});

function ensureLayoutCid() {
  ++this._renderCount;
  //set the layoutCidAttributeName on this.$el if there was no template
  this.$el.attr(layoutCidAttributeName, this.cid);
}

function ensureLayoutViewsTargetElement() {
  if (!this.$('[' + layoutCidAttributeName + '="' + this.cid + '"]')[0]) {
    throw new Error();
  }
}

function getLayoutViewsTargetElement() {
  return this.$('[' + layoutCidAttributeName + '="' + this.cid + '"]')[0] || this.el[0] || this.el;
}
