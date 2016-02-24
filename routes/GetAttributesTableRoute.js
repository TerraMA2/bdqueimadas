"use strict";

/** @class GetAttributesTableRoute - Route of the GetAttributesTable controller. */
var GetAttributesTableRoute = function(app) {
  var controller = app.controllers.GetAttributesTableController;
  app.post('/get-attributes-table', controller);
};

module.exports = GetAttributesTableRoute;
