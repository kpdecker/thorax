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
  destroyViews: true,
  render: generateRenderLayout(),
  setView: function(view){
    if (typeof view === 'string') {
      view = new (Thorax.registry.view(view));
    }
    ensureRendered.call(this);
    var old_view = this._view;
    if (view == old_view){
      return false;
    }
    this.trigger('change:view:start', view, old_view);
    old_view && old_view.trigger('deactivated');
    view && view.trigger('activated');
    if (old_view && old_view.el && old_view.el.parentNode) {
      old_view.$el.remove();
    }
    //make sure the view has been rendered at least once
    view && ensureRendered.call(view);
    view && getLayoutViewsTargetElement.call(this).appendChild(view.el);
    window.scrollTo(0, minimumScrollYOffset);
    this._view = view;
    this.destroyViews && old_view && old_view.destroy();
    this._view && this._view.trigger('ready');
    this.trigger('change:view:end', view, old_view);
    return view;
  },

  getView: function() {
    return this._view;
  }
});

function ensureLayoutViewsTargetElement() {
  if (!this.$('[' + layoutCidAttributeName + '="' + this.cid + '"]')[0]) {
    throw new Error();
  }
}

function getLayoutViewsTargetElement() {
  return this.$('[' + layoutCidAttributeName + '="' + this.cid + '"]')[0] || this.el[0] || this.el;
}
