"use strict";

/**
 * Route of the GetBdqNames controller.
 * @class GetBdqNamesRoute
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 */
var GetBdqNamesRoute = function(app) {
  var controller = app.controllers.GetBdqNamesController;
  app.get('/get-bdq-names', controller);
};

module.exports = GetBdqNamesRoute;
