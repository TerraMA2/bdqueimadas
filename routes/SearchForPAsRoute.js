"use strict";

/**
 * Route of the SearchForPAs controller.
 * @class SearchForPAsRoute
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 */
var SearchForPAsRoute = function(app) {
  var controller = app.controllers.SearchForPAsController;
  app.get(BASE_URL + 'search-for-pas', controller);
};

module.exports = SearchForPAsRoute;
