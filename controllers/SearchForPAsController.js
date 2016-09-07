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

    var value = request.query.value;

    // Call of the method 'searchForPAs', responsible for returning the protected areas that match the provided value
    memberFilter.searchForPAs(request.query.value, function(err, result) {
      if(err) return console.error(err);

      // Array responsible for keeping the data obtained by the method 'getAttributesTableData'
      var data = [];

      // Conversion of the result object to array
      result.rows.forEach(function(val){
        var temp = [];
        for(var key in val) temp.push(val[key]);
        data.push(temp);
      });

      // JSON response
      response.json({
        draw: parseInt(request.body.draw),
        recordsTotal: parseInt(resultCount.rows[0].count),
        recordsFiltered: parseInt(resultCountWithSearch.rows[0].count),
        data: data
      });
    });
  };

  return searchForPAsController;
};

module.exports = SearchForPAsController;
