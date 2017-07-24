"use strict";

/**
 * Route of the SearchForCities controller.
 * @class SearchForCitiesRoute
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 */
var SearchForCitiesRoute = function(app) {
  var controller = app.controllers.SearchForCitiesController;
  app.get(BASE_URL + 'search-for-cities', controller);
};

module.exports = SearchForCitiesRoute;
