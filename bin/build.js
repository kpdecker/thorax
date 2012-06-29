var fs = require('fs'),
    path = require('path'),
    _ = require('underscore'),
    childProcess = require('child_process'),
    exec = childProcess.exec,
    async = require('async'),
    mkdirp = require('mkdirp'),
    watchTree = require('fs-watch-tree').watchTree,
    packageJSON = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'))),
    deepExtend = require(path.join(__dirname, 'deep-extend.js')),
    lumbarJSONByTarget = {},
    packageJSONByTarget = {};

function execute(commands, callback) {
  exec(commands.join(";"), function(error, stdout, stderr) {
    if (stderr) {
      console.log(stderr);
    }
    callback();
  });
}

function saveLumbarJSONForTarget(target) {
  fs.writeFileSync(target, JSON.stringify(lumbarJSONByTarget[target], null, 2))
}

function savePackageJSONForTarget(target) {
  fs.writeFileSync(target, JSON.stringify(packageJSONByTarget[target], null, 2))
}

function buildPackage(name, target, complete) {
  var build = packageJSON.builds[name],
      lumbarJSONLocation = path.join(target, 'lumbar.json'),
      pacakgeJSONLocation = path.join(target, 'package.json');
      lumbarJSONByTarget[lumbarJSONLocation] = lumbarJSONByTarget[lumbarJSONLocation] || {};
      packageJSONByTarget[pacakgeJSONLocation] = packageJSONByTarget[pacakgeJSONLocation] || {};
  function buildFiles() {
    var directives = _.map(build.directories, function(targetPath, sourcePath) {
      return {
        isFile: false,
        targetPath: targetPath,
        sourcePath: sourcePath
      };
    });
    directives = directives.concat(_.map(build.files, function(targetPath, sourcePath) {
      return {
        isFile: true,
        targetPath: targetPath,
        sourcePath: sourcePath
      };
    }));

    async.forEachSeries(directives, function(fileInfo, next) {
      function copy() {
        if (fileInfo.isFile && path.basename(fileInfo.sourcePath) === 'package.json') {
          deepExtend(packageJSONByTarget[pacakgeJSONLocation], JSON.parse(fs.readFileSync(fileInfo.sourcePath)));
          next();
        } else if (fileInfo.isFile && path.basename(fileInfo.sourcePath) === 'lumbar.json') {
          deepExtend(lumbarJSONByTarget[lumbarJSONLocation], JSON.parse(fs.readFileSync(fileInfo.sourcePath)));
          next();
        } else {
          execute(['cp -r ' + path.join(__dirname, '..', fileInfo.sourcePath) + (!fileInfo.isFile ? '/' : '') + ' ' + path.join(target, fileInfo.targetPath)], next);
        }
      }
      if (!path.existsSync(path.join(target, fileInfo.targetPath)) && !fileInfo.isFile) {
        mkdirp(path.join(target, fileInfo.targetPath), copy)
      } else {
        copy();
      }
    }, function() {
      if (path.existsSync(lumbarJSONLocation)) {
        deepExtend(lumbarJSONByTarget[lumbarJSONLocation], JSON.parse(fs.readFileSync(lumbarJSONLocation)));
      }
      if (path.existsSync(pacakgeJSONLocation)) {
        deepExtend(packageJSONByTarget[pacakgeJSONLocation], JSON.parse(fs.readFileSync(pacakgeJSONLocation)));
      }
      complete();
    });
  }
  function buildBuilds(completeBuildBuilds) {
    async.forEachSeries(_.clone(build.builds), function(subBuild, next) {
      buildPackage(subBuild, target, next);
    }, completeBuildBuilds);
  }
  if (build.builds) {
    buildBuilds(buildFiles);
  } else {
    buildFiles();
  }
}

function buildAllPackages() {
  var concatBuilds = {};
  _.each(packageJSON.builds, function(build, name) {
    if (build.sources && build.target) {
      concatBuilds[name] = build;
    }
  });
  
  var builds = _.clone(packageJSON.builds);
  _.keys(concatBuilds).forEach(function(key) {
    delete builds[key]
  });

  buildConcatBuilds(concatBuilds, function() {
    //console.log('will build ',builds)
    async.forEachSeries(_.map(builds, function(build, name) {
      return {
        name: name,
        build: build
      };
    }), function(item, next) {
      var build = item.build;
      var name = item.name;
      var targetDirectory = path.join(__dirname, '..', 'builds', name);
      execute(['rm -rf ' + targetDirectory], function() {
        mkdirp(targetDirectory, function() {
          buildPackage(name, targetDirectory, function() {
            var lumbarJSONLocation = path.join(targetDirectory, 'lumbar.json');
            if (path.existsSync(lumbarJSONLocation)) {
              saveLumbarJSONForTarget(lumbarJSONLocation);
            }
            var packageJSONLocation = path.join(targetDirectory, 'package.json');
            if (path.existsSync(packageJSONLocation)) {
              savePackageJSONForTarget(packageJSONLocation);
            }
            execute(['zip ' + targetDirectory + '.zip -r ' + targetDirectory], function() {
              console.log('built', name);
              next();
            });
          });
        });
      });
    });
  });
}

function buildConcatBuilds(builds, next) {
  async.forEachSeries(_.map(builds, function(build, key) {
    return build;
  }), function(item, next) {
    var targetPath = path.join(__dirname, '..', item.target),
        targetDir = path.dirname(targetPath);
    function writeFile() {
      console.log('wrote', targetPath);
      fs.writeFile(targetPath, item.sources.map(function(source) {
        return fs.readFileSync(path.join(__dirname, '..', source));
      }).join("\n"), next);
    }
    if (!path.existsSync(targetDir)) {
      mkdirp(targetDir, writeFile);
    } else {
      writeFile();
    }
  }, next);
}

buildAllPackages();

var watchCallback = _.throttle(function(event) {
  buildAllPackages();
}, 1000);
watchTree(path.join(__dirname, '..', 'packages'), watchCallback);
watchTree(path.join(__dirname, '..', 'lib'), watchCallback);
