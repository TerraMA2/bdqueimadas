"use strict";

/**
 * Route of the ExistsDataToExport controller.
 * @class ExistsDataToExportRoute
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 */
var ExistsDataToExportRoute = function(app) {
  var controller = app.controllers.ExistsDataToExportController;
  app.get('/exists-data-to-export', controller);
};

module.exports = ExistsDataToExportRoute;
