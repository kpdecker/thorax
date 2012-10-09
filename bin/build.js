var fs = require('fs'),
    path = require('path'),
    handlebars = require('handlebars'),
    packageJSON = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json')));

var templateCache = {},
    override = {
      freeze: '',
      beforeConfigure: '',
      'constructor': '',
      configure: '',
      extend: '',
      on: ''
    },
    includedPlugins = ['thorax'];

handlebars.registerHelper('has-plugin', function(name, options) {
  if (includedPlugins.indexOf(name) === -1) {
    return options.inverse(this);
  } else {
    return options.fn(this);
  }
});

handlebars.registerHelper('inject', function(name, options) {
  override[name] += options.fn(this);
});

function renderTemplate(name, data) {
  if (!templateCache[name]) {
    var filename = path.join(__dirname, '..', 'src', name) + '.js';
    templateCache[name] = handlebars.compile(fs.readFileSync(filename).toString());
  }
  data = data || {};
  data.version = packageJSON.version;
  data.override = override;
  data.ldelim = '{';
  data.rdelim = '}';
  return templateCache[name](data);
}

function writeFile(filename, output) {
  fs.writeFileSync(filename, output);
  console.log('Wrote: ' + filename);
}

var loadedOverrides = [];
function loadOverrides(plugin) {
  if (loadedOverrides.indexOf(plugin) !== -1) {
    return;
  }
  loadedOverrides.push(plugin);
  //rendering the template will cause block helpers to execute
  //collecting the injected overrides
  renderTemplate(plugin);
}

function getLicense() {
  return fs.readFileSync(path.join(__dirname, '..', 'LICENSE')).toString().split('\n').map(function(line){
    return '// ' + line;
  }).join('\n') + '\n';
}

module.exports = function(target, plugins) {
  var buildMobile = false;
  if (plugins.indexOf('--mobile') !== -1) {
    plugins = [];
    buildMobile = true;
  }

  if (!plugins.length) {
    plugins = [];
    for (var name in packageJSON.plugins) {
      if (name !== 'mobile' || (name === 'mobile' && buildMobile)) {
        plugins.push(name);
      }
    }
  }
  console.log('Building Thorax with:', plugins);
  var output = '';

  //loop through first to get a complete list of plugins
  //for the "has-plugin" helper
  plugins.forEach(function(plugin) {
    var deps = packageJSON.plugins[plugin] || [];
    if (deps.length) {
      deps.forEach(function(dep) {
        if (includedPlugins.indexOf(dep) === -1) {
          includedPlugins.push(dep);
        }
      });
    }
    if (includedPlugins.indexOf(plugin) === -1) {
      includedPlugins.push(plugin);
    }
  });

  //load overrides
  includedPlugins.forEach(function(plugin) {
    //rendering the template will cause block helpers to execute
    //collecting the injected overrides
    renderTemplate(plugin);
  });

  //now render
  includedPlugins.forEach(function(item) {
    output += renderTemplate(item) + '\n';
  });

  writeFile(target, getLicense() + renderTemplate('fragments/scope', {
    'yield': output
  }));
};
