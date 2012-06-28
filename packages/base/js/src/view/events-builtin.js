internalViewEvents['initialize:after'] = function(options) {
  //bind model or collection if passed to constructor
  if (options && options.model) {
    this.setModel(options.model);
  }
};

View.registerEvents(internalViewEvents);
