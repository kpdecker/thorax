Thorax.View.registerPartialHelper('loading', function(collectionOrModel, partial) {
  if (arguments.length === 1) {
    partial = collectionOrModel;
    collectionOrModel = false;
  }

  function callback(scope) {
    var content;
    if (partial.view.$el.hasClass(partial.view._loadingClassName)) {
      content = partial.fn(scope || partial.context());
    } else {
      content = partial.inverse(scope || partial.context());
    }
    partial.html(content);
  }

  this._view._loadingCallbacks = this._view._loadingCallbacks || [];
  this._view._loadingCallbacks.push(callback);
  partial.on('destroyed', function() {
    this._view._loadingCallbacks = _.without(this._view._loadingCallbacks, callback);
  }, this);

  callback(this);
});

Handlebars.helpers.collection.addCallback(function(collection, partial) {
  if (arguments.length === 1) {
    partial = collection;
    collection = this._view.collection;
  }
  var collectionElement = partial.$el;
  if (partial.options['loading-view'] || partial.options['loading-template']) {
    var item;
    var callback = Thorax.loadHandler(_.bind(function() {
      if (collection.length === 0) {
        collectionElement.empty();
      }
      if (partial.options['loading-view']) {
        var view = this.view(partial.options['loading-view'], this);
        if (partial.options['loading-template']) {
          view.render(this.renderTemplate(partial.options['loading-template'], this));
        } else {
          view.render();
        }
        item = view;
      } else {
        item = this.renderTemplate(partial.options['loading-template'], this);
      }
      this._view.appendItem(partial, collection, item, collection.length);
      collectionElement.children().last().attr('data-loading-element', collection.cid);
    }, this), _.bind(function() {
      collectionElement.find('[data-loading-element="' + collection.cid + '"]').remove();
    }, this));
    collection.on('load:start', callback);
    partial.on('freeze', function() {
      collection.off('load:start', callback);
    });
  }
}); 
