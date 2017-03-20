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

    // Setting the string to uppercase, removing excessive spaces and non alphanumeric characters
    var searchValue = request.query.value.toUpperCase().replace(/\W /g, '').replace(/\s+/g, ' ').trim();
    var searchFor = {
      'UCE': true,
      'UCF': true,
      'TI': true
    };

    var searchValueArray = searchValue.split(' ');

    var uceInArray = stringInArray(searchValueArray, 'UCE');
    var ucfInArray = stringInArray(searchValueArray, 'UCF');
    var tiInArray = stringInArray(searchValueArray, 'TI');

    var index = searchValueArray.indexOf("UCE");
    if(index > -1) searchValueArray.splice(index, 1);

    index = searchValueArray.indexOf("UCF");
    if(index > -1) searchValueArray.splice(index, 1);

    index = searchValueArray.indexOf("TI");
    if(index > -1) searchValueArray.splice(index, 1);

    if(uceInArray && !ucfInArray && !tiInArray) {
      searchFor.UCF = false;
      searchFor.TI = false;
    } else if(!uceInArray && ucfInArray && !tiInArray) {
      searchFor.UCE = false;
      searchFor.TI = false;
    } else if(!uceInArray && !ucfInArray && tiInArray) {
      searchFor.UCE = false;
      searchFor.UCF = false;
    } else if(uceInArray && ucfInArray && !tiInArray) {
      searchFor.TI = false;
    } else if(!uceInArray && ucfInArray && tiInArray) {
      searchFor.UCE = false;
    } else if(uceInArray && !ucfInArray && tiInArray) {
      searchFor.UCF = false;
    }

    searchValue = searchValueArray.join(" ");

    if(searchValue.length >= request.query.minLength) {
      // Call of the method 'searchForPAs', responsible for returning the protected areas that match the provided value
      memberFilter.searchForPAs(request.pgPool, searchValue, searchFor, function(err, result) {
        if(err) return console.error(err);

        // Array responsible for keeping the data obtained by the method 'searchForPAs'
        var data = [];

        // Conversion of the result object to array
        result.rows.forEach(function(val) {
          data.push({
            label: val.type + ' - ' + val.name,
            value: {
              id: val.id,
              name: val.name,
              ngo: val.ngo,
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

  /**
   * Verifies if a string exists in an array.
   * @param {array} array - Array where the search will be performed
   * @param {string} string - String to be searched
   * @returns {boolean} boolean - Flag that indicates if the string exists in the array
   *
   * @private
   * @function stringInArray
   * @memberof SearchForPAsController
   * @inner
   */
  var stringInArray = function(array, string) {
    for(var i = 0, arrayLength = array.length; i < arrayLength; i++) {
      if(array[i].toString() === string.toString())
        return true;
    }
    return false;
  };

  return searchForPAsController;
};

module.exports = SearchForPAsController;
