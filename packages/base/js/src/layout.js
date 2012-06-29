var Layout = View.extend({
  destroyViews: true,

  render: function(output) {
    var response;
    //a template is optional in a layout
    if (output || this.template) {
      //but if present, it must have embedded an element containing layoutCidAttributeName 
      response = View.prototype.render.call(this, output);
      ensureLayoutViewsTargetElement.call(this);
    } else {
      ++this._renderCount;
      //set the layoutCidAttributeName on this.$el if there was no template
      this.$el.attr(layoutCidAttributeName, this.cid);
    }
    return response;
  },

  setView: function(view){
    if (typeof view === 'string') {
      view = new (Thorax.registry.view(view));
    }
    ensureRendered.call(this);
    var oldView = this._view;
    if (view == oldView){
      return false;
    }
    this.trigger('change:view:start', view, oldView);
    oldView && oldView.trigger('deactivated');
    view && view.trigger('activated');
    if (oldView && oldView.el && oldView.el.parentNode) {
      oldView.$el.remove();
    }
    //make sure the view has been rendered at least once
    view && ensureRendered.call(view);
    view && getLayoutViewsTargetElement.call(this).appendChild(view.el);
    window.scrollTo(0, minimumScrollYOffset);
    this._view = view;
    //ensure oldView is not a ViewController 
    if (this.destroyViews && oldView && !oldView.routes && !oldView.navigate) {
      oldView.destroy();
    }
    this._view && this._view.trigger('ready');
    this.trigger('change:view:end', view, oldView);
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
