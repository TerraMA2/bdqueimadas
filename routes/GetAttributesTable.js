module.exports = function(app) {
  var controller = app.controllers.GetAttributesTable;
  app.post('/get-attributes-table', controller);
};
