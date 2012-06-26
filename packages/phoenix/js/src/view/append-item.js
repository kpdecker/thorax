//patched appendItem for filtered renderItem
//https://github.com/walmartlabs/thorax/commit/da63c43f92a52fea48e27649f3874402abb73a46
View.prototype.appendItem = function(model, index, options) {
  //empty item
  if (!model) {
    return;
  }

  var item_view,
      collection_element = getCollectionElement.call(this);

  options = options || {};

  //if index argument is a view
  if (index && index.el) {
    index = collection_element.find('> *').indexOf(index.el) + 1;
  }

  //if argument is a view, or html string
  if (model.el || typeof model === 'string') {
    item_view = model;
  } else {
    index = index || this.collection.indexOf(model) || 0;
    item_view = this.renderItem(model, index);
  }

  if (item_view) {

    if (item_view.cid) {
      this._views[item_view.cid] = item_view;
    }

    var item_element = item_view.el ? [item_view.el] : _.filter($(item_view), function(node) {
      //filter out top level whitespace nodes
      return node.nodeType === ELEMENT_NODE_TYPE;
    });

    $(item_element).attr(model_cid_attribute_name, model.cid);

    // Not all items may have been inserted into the DOM tree so we need to
    // walk the tree to find the proper parent. This has a pathological case
    // where the last model is inserted into an empty container, but this
    // should be the exception rather than the norm. Implementors who
    // are dealing with this case in the sort of volume that would have
    // siginficant performance impact should consider subcollections rather
    // than filtered renderItem implementations
    var insertIndex = index,
        inserted = false;
    while (!inserted && insertIndex > 0) {
      var previous_model = this.collection.at(--insertIndex);
      if (!previous_model) {
        break;
      }

      //use last() as appendItem can accept multiple nodes from a template
      var previousElement = collection_element.find('[' + model_cid_attribute_name + '="' + previous_model.cid + '"]');
      if (previousElement.length) {
        previousElement.last().after(item_element);
        inserted = true;
      }
    }
    if (!inserted) {
      collection_element.prepend(item_element);
    }

    appendViews.call(this, item_element);

    if (!options.silent) {
      this.trigger('rendered:item', item_element);
    }
  }
  return item_view;
};
