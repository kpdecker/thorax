_.extend(Thorax.View.prototype, {
  html: function(html) {
    if (typeof html === 'undefined') {
      return this.el.innerHTML;
    } else {
      var element;
      if (this._collectionOptions && this._renderCount) {
        //preserveCollectionElement calls the callback after it has a reference
        //to the collection element, calls the callback, then re-appends the element
        preserveCollectionElement.call(this, function() {
          element = $(this.el).html(html);
        });
      } else {
        element = $(this.el).html(html);
      }
      appendViews.call(this);
      return element;
    }
  },

  renderCollection: function() {
    this.render();
    var collection_element = getCollectionElement.call(this).empty();
    collection_element.attr(collectionCidAttributeName, this.collection.cid);
    if (this.collection.length === 0 && this.collection.isPopulated()) {
      appendEmpty.call(this);
    } else {
      this.collection.forEach(this.appendItem, this);
    }
    this.trigger('rendered:collection', collection_element);
  },

  renderItem: function(item, i) {
    ensureViewHasName.call(this);
    return this.template(this.name + '-item', this.itemContext(item, i));
  },
  
  renderEmpty: function() {
    ensureViewHasName.call(this);
    return this.template(this.name + '-empty', this.emptyContext());
  },

  itemContext: function(item, i) {
    return item.attributes;
  },

  emptyContext: function() {},

  setCollectionOptions: function(options) {
    if (!this._collectionOptions) {
      this._collectionOptions = {
        fetch: true,
        success: false,
        errors: true
      };
    }
    _.extend(this._collectionOptions, options || {});
    return this._collectionOptions;
  },

  setCollection: function(collection, options) {
    var old_collection = this.collection;

    this.freeze({
      model: false, //may be false
      collection: old_collection
    });
    
    this.collection = collection;
    this.collection.cid = _.uniqueId('collection');
    this.setCollectionOptions(options);
  
    if (this.collection) {
      this._events.collection.forEach(function(event) {
        this.collection.bind(event[0], event[1]);
      }, this);
    
      this.collection.trigger('set', this.collection, old_collection);

      if (this._shouldFetch(this.collection, this._collectionOptions)) {
        var success = this._collectionOptions.success;
        this.collection.load(function(){
            success && success(this.collection);
          }, this._collectionOptions);
      } else {
        //want to trigger built in event handler (render())
        //without triggering event on collection
        onCollectionReset.call(this);
      }
    }
  
    return this;
  }
});

Thorax.View.registerEvents({
  'initialize:after': function(options) {
    if (options && options.collection) {
      this.setCollection(options.collection);
    }
  },
  collection: {
    add: function(model, collection) {
      //if collection was empty, clear empty view
      if (this.collection.length === 1) {
        getCollectionElement.call(this).empty();
      }
      this.appendItem(model, collection.indexOf(model));
    },
    remove: function(model) {
      this.$('[' + modelCidAttributeName + '="' + model.cid + '"]').remove();
      for (var cid in this._views) {
        if (this._views[cid].model && this._views[cid].model.cid === model.cid) {
          this._views[cid].destroy();
          delete this._views[cid];
          break;
        }
      }
      if (this.collection.length === 0) {
        appendEmpty.call(this);
      }
    },
    reset: function() {
      onCollectionReset.call(this);
    },
    error: function(collection, message) {
      if (this._collectionOptions.errors) {
        this.trigger('error', message);
      }
    }
  }
});

function getCollectionElement() {
  var selector = this._collectionSelector || default_collection_selector;
  var element = this.$(selector);
  if (element.length === 0) {
    return $(this.el);
  } else {
    return element;
  }
}

function preserveCollectionElement(callback) {
  var old_collection_element = getCollectionElement.call(this);
  callback.call(this);
  var new_collection_element = getCollectionElement.call(this);
  if (old_collection_element.length && new_collection_element.length) {
    new_collection_element[0].parentNode.insertBefore(old_collection_element[0], new_collection_element[0]);
    new_collection_element[0].parentNode.removeChild(new_collection_element[0]);
  }
}

function appendEmpty() {
  getCollectionElement.call(this).empty();
  this.appendItem(this.renderEmpty(), 0, {silent: true});
  this.trigger('rendered:empty');
}

function onCollectionReset() {
  this.renderCollection();
}

