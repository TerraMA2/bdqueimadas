"use strict";

/**
 * Route of the GetAttributesTable controller.
 * @class GetAttributesTableRoute
 */
var GetAttributesTableRoute = function(app) {
  var controller = app.controllers.GetAttributesTableController;
  app.post('/get-attributes-table', controller);
};

module.exports = GetAttributesTableRoute;
