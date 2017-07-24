"use strict";

/**
 * Route of the GetAttributesTable controller.
 * @class GetAttributesTableRoute
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 */
var GetAttributesTableRoute = function(app) {
  var controller = app.controllers.GetAttributesTableController;
  app.post(BASE_URL + 'get-attributes-table', controller);
};

module.exports = GetAttributesTableRoute;
