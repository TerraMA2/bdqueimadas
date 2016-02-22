module.exports = function(app) {
  var controller = app.controllers.test;
  app.get('/test', controller);
};
