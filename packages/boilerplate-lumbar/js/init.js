Thorax.templatePathPrefix = 'templates/';
var Application = module.exports = new Thorax.Application(module.exports);
$(document).ready(function() {
  $('body').append(Application.el);
  Application.initBackboneLoader();
  Application.start({
    pushState: false,
    root: '/'
  });
});
