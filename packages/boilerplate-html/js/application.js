var Application = Thorax.Application.create();

$(function() {
  document.body.appendChild(Application.el);
});

Application.setView(Thorax.View.create({
  template: 'Hello World!'
}));
