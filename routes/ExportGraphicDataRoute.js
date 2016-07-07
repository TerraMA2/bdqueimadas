"use strict";

/**
 * Route of the ExportGraphicData controller.
 * @class ExportGraphicDataRoute
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 */
var ExportGraphicDataRoute = function(app) {
  var controller = app.controllers.ExportGraphicDataController;
  app.get('/export-graphic-data', controller);
};

module.exports = ExportGraphicDataRoute;
