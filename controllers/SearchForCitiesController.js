"use strict";

/**
 * Controller responsible for returning the cities that match the provided value.
 * @class SearchForCitiesController
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberFilter - 'Filter' model.
 */
var SearchForCitiesController = function(app) {

  // 'Filter' model
  var memberFilter = new (require('../models/Filter.js'))();

  /**
   * Processes the request and returns a response.
   * @param {json} request - JSON containing the request data
   * @param {json} response - JSON containing the response data
   *
   * @function searchForCitiesController
   * @memberof SearchForCitiesController
   * @inner
   */
  var searchForCitiesController = function(request, response) {

    // Setting the string to uppercase, removing excessive spaces and non alphanumeric characters
    var searchValue = request.query.value.toUpperCase().replace(/\W /g, '').replace(/\s+/g, ' ').trim();

    if(searchValue.length >= request.query.minLength) {
      // Call of the method 'searchForCities', responsible for returning the cities that match the provided value
      memberFilter.searchForCities(request.pgPool, searchValue, function(err, result) {
        if(err) return console.error(err);

        // Array responsible for keeping the data obtained by the method 'searchForCities'
        var data = [];

        // Conversion of the result object to array
        result.rows.forEach(function(val) {
          data.push({
            label: val.state + ' - ' + val.name,
            value: {
              id: val.id,
              type: val.state
            }
          });
        });

        // JSON response
        response.json(data);
      });
    } else {
      response.json([]);
    }
  };

  return searchForCitiesController;
};

module.exports = SearchForCitiesController;
