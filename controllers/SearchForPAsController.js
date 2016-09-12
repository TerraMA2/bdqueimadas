"use strict";

/**
 * Controller responsible for returning the protected areas that match the provided value.
 * @class SearchForPAsController
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberFilter - 'Filter' model.
 */
var SearchForPAsController = function(app) {

  // 'Filter' model
  var memberFilter = new (require('../models/Filter.js'))();

  /**
   * Processes the request and returns a response.
   * @param {json} request - JSON containing the request data
   * @param {json} response - JSON containing the response data
   *
   * @function searchForPAsController
   * @memberof SearchForPAsController
   * @inner
   */
  var searchForPAsController = function(request, response) {

    var searchValue = request.query.value.toUpperCase();

    var searchFor = {
      'UCE': true,
      'UCF': true,
      'TI': true
    };

    if(searchValue.indexOf('UCE') !== -1 && searchValue.indexOf('UCF') === -1 && searchValue.indexOf('TI') === -1) {
      searchFor.UCF = false;
      searchFor.TI = false;

      searchValue = searchValue.replace('UCE', '');
    } else if(searchValue.indexOf('UCE') === -1 && searchValue.indexOf('UCF') !== -1 && searchValue.indexOf('TI') === -1) {
      searchFor.UCE = false;
      searchFor.TI = false;

      searchValue = searchValue.replace('UCF', '');
    } else if(searchValue.indexOf('UCE') === -1 && searchValue.indexOf('UCF') === -1 && searchValue.indexOf('TI') !== -1) {
      searchFor.UCE = false;
      searchFor.UCF = false;

      searchValue = searchValue.replace('TI', '');
    } else if(searchValue.indexOf('UCE') !== -1 && searchValue.indexOf('UCF') !== -1 && searchValue.indexOf('TI') === -1) {
      searchFor.TI = false;

      searchValue = searchValue.replace('UCE', '');
      searchValue = searchValue.replace('UCF', '');
    } else if(searchValue.indexOf('UCE') === -1 && searchValue.indexOf('UCF') !== -1 && searchValue.indexOf('TI') !== -1) {
      searchFor.UCE = false;

      searchValue = searchValue.replace('UCF', '');
      searchValue = searchValue.replace('TI', '');
    } else if(searchValue.indexOf('UCE') !== -1 && searchValue.indexOf('UCF') === -1 && searchValue.indexOf('TI') !== -1) {
      searchFor.UCF = false;

      searchValue = searchValue.replace('UCE', '');
      searchValue = searchValue.replace('TI', '');
    } else {
      searchValue = searchValue.replace('UCE', '');
      searchValue = searchValue.replace('UCF', '');
      searchValue = searchValue.replace('TI', '');
    }

    // Removing excessive spaces and non alphanumeric characters
    searchValue = searchValue.replace(/\W /g, '').replace(/\s+/g, ' ').trim();

    if(searchValue.length > 3) {
      // Call of the method 'searchForPAs', responsible for returning the protected areas that match the provided value
      memberFilter.searchForPAs(searchValue, searchFor, function(err, result) {
        if(err) return console.error(err);

        // Array responsible for keeping the data obtained by the method 'searchForPAs'
        var data = [];

        // Conversion of the result object to array
        result.rows.forEach(function(val) {
          data.push({
            label: val.type + ' - ' + val.name,
            value: {
              id: val.id,
              type: val.type
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

  return searchForPAsController;
};

module.exports = SearchForPAsController;
