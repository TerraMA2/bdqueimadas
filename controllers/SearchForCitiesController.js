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
    var searchValue = request.query.value.toUpperCase().replace(/( )+/g, ' ').trim();

    var countries = request.query.countries !== undefined && request.query.countries !== null && request.query.countries !== "" ? request.query.countries : null;
    var states = request.query.states !== undefined && request.query.states !== null && request.query.states !== "" ? request.query.states : null;

    if(searchValue.length >= request.query.minLength) {
      // Call of the method 'searchForCities', responsible for returning the cities that match the provided value
      memberFilter.searchForCities(searchValue, countries, states, function(err, result) {
        if(err) return console.error(err);

        // Array responsible for keeping the data obtained by the method 'searchForCities'
        var data = [];

        // Conversion of the result object to array
        result.rows.forEach(function(val) {
          data.push({
            label: val.name + ' - ' + val.state,
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
