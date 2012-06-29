Thorax.templatePathPrefix = 'templates/';
var Application = module.exports = Thorax.Application.create(module.exports);
$(document).ready(function() {
  $('body').append(Application.el);
  Application.initBackboneLoader();
  Application.start({
    pushState: false,
    root: '/'
  });
});
