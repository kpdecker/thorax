_.extend(View, {
  registerHelper: function(name, callback) {
    this[name] = callback;
    Handlebars.registerHelper(name, this[name]);
    return callback;
  },
  expandToken: function(input, scope) {
    if (input && input.indexOf && input.indexOf('{{') >= 0) {
      var re = /(?:\{?[^{]+)|(?:\{\{([^}]+)\}\})/g,
          match,
          ret = [];
      function deref(token, scope) {
        var segments = token.split('.'),
            len = segments.length;
        for (var i = 0; scope && i < len; i++) {
          if (segments[i] !== 'this') {
            scope = scope[segments[i]];
          }
        }
        return scope;
      }
      while (match = re.exec(input)) {
        if (match[1]) {
          var params = match[1].split(/\s+/);
          if (params.length > 1) {
            var helper = params.shift();
            params = params.map(function(param) { return deref(param, scope); });
            if (Handlebars.helpers[helper]) {
              ret.push(Handlebars.helpers[helper].apply(scope, params));
            } else {
              // If the helper is not defined do nothing
              ret.push(match[0]);
            }
          } else {
            ret.push(deref(params[0], scope));
          }
        } else {
          ret.push(match[0]);
        }
      }
      input = ret.join('');
    }
    return input;
  },
  tag: function(attributes, content, scope) {
    var htmlAttributes = _.clone(attributes),
        tag = htmlAttributes.tag || htmlAttributes.tagName || 'div';
    if (htmlAttributes.tag) {
      delete htmlAttributes.tag;
    }
    if (htmlAttributes.tagName) {
      delete htmlAttributes.tagName;
    }
    if (htmlAttributes.call) {
      htmlAttributes[callMethodAttributeName] = htmlAttributes.call;
      delete htmlAttributes.tagName;
    }
    return '<' + tag + ' ' + _.map(htmlAttributes, function(value, key) {
      if (typeof value === 'undefined') {
        return '';
      }
      var formattedValue = value;
      if (scope) {
        formattedValue = View.expandToken(value, scope);
      }
      return key + '="' + Handlebars.Utils.escapeExpression(formattedValue) + '"';
    }).join(' ') + '>' + (content || '') + '</' + tag + '>';
  },
  htmlAttributesFromOptions: function(options) {
    var htmlAttributes = {};
    if (options.tag) {
      htmlAttributes.tag = options.tag;
    }
    if (options.tagName) {
      htmlAttributes.tagName = options.tagName;
    }
    if (options['class']) {
      htmlAttributes['class'] = options['class'];
    }
    if (options.id) {
      htmlAttributes.id = options.id;
    }
    return htmlAttributes
  }
});

View.registerHelper('template', function(name, options) {
  var context = _.extend({}, this, options ? options.hash : {});
  var output = View.prototype.renderTemplate.call(this._view, name, context);
  return new Handlebars.SafeString(output);
});

View.registerHelper('layout', function(options) {
  options.hash[layoutCidAttributeName] = this._view.cid;
  return new Handlebars.SafeString(View.tag.call(this, options.hash, null, this));
});

var paramMatcher = /:(\w+)/g;
View.registerHelper('url', function(url) {
  var matches = url.match(paramMatcher),
      context = this;
  if (matches) {
    url = url.replace(paramMatcher, function(match, key) {
      return context[key] ? getValue(context, key) : match;
    });
  }
  url = View.expandToken(url, context);
  return (Backbone.history._hasPushState ? Backbone.history.options.root : '#') + url;
});

View.registerHelper('button', function(method, options) {
  options.hash.tag = 'button';
  options.hash[callMethodAttributeName] = method;
  return new Handlebars.SafeString(View.tag.call(this, options.hash, options.fn, this));
});

View.registerHelper('link', function(url, options) {
  options.hash.tag = 'a';
  options.hash.href = Handlebars.helper.url.call(this, url);
  options.hash[callMethodAttributeName] = '_anchorClick';
  return new Handlebars.SafeString(View.tag.call(this, options.hash, options.fn, this));
});

internalViewEvents['click [' + callMethodAttributeName + ']'] = function(event) {
  this[$(event.target).attr(callMethodAttributeName)].call(this, event);
};

View.prototype._anchorClick = function(event) {
  var target = $(event.currentTarget),
      href = target.attr('href');
  // Route anything that starts with # or / (excluding //domain urls)
  if (href && (href[0] === '#' || (href[0] === '/' && href[1] !== '/'))) {
    Backbone.history.navigate(href, {
      trigger: true
    });
    event.preventDefault();
  }
};