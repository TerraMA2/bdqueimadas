"use strict";

/**
 * Controller responsible for returning the attributes table data accordingly with the received parameters.
 * @class GetAttributesTableController
 *
 * @property {object} memberFilter - 'Filter' model.
 */
var GetAttributesTableController = function(app) {

  // 'Filter' model
  var memberFilter = new (require('../models/Filter.js'))();

  /**
   * Processes the request and returns a response.
   * @param {json} request - JSON containing the request data
   * @param {json} response - JSON containing the response data
   * @returns {function} getAttributesTableController - The controller function
   *
   * @function getAttributesTableController
   * @memberof GetAttributesTableController
   * @inner
   */
  var getAttributesTableController = function(request, response) {

    // Object responsible for keep several information to be used in the database query
    var options = {};
    // Array responsible for keep the query 'order by' field names and type (asc or desc)
    var order = [];

    // Verifications of the 'options' object items
    if(request.body.satellite !== '') options.satellite = request.body.satellite;
    if(request.body.extent !== '') options.extent = request.body.extent;

    // Setting of the 'order' array, the fields names are obtained by the columns numbers
    var arrayFound = request.body.columns.filter(function(item) {
      for(var i = 0; i < request.body.order.length; i++) {
        if(item.data === request.body.order[i].column)
          order.push({ "column": item.name, "dir": request.body.order[i].dir });
      }
    });

    // Call of the method 'getAttributesTableData', responsible for returning data of the attributes table accordingly with the request parameters
    memberFilter.getAttributesTableData(request.body.length, request.body.start, order, request.body.search.value, request.body.dateFrom, request.body.dateTo, options, function(err, result) {
      if(err) return console.error(err);

      // Call of the method 'getAttributesTableCount', responsible for returning the number of rows of the attributes table accordingly with the request parameters, not considering the table search
      memberFilter.getAttributesTableCount(request.body.dateFrom, request.body.dateTo, options, function(err, resultCount) {
        if(err) return console.error(err);

        // Call of the method 'getAttributesTableCount', responsible for returning the number of rows of the attributes table accordingly with the request parameters, considering the table search
        memberFilter.getAttributesTableCountWithSearch(request.body.dateFrom, request.body.dateTo, request.body.search.value, options, function(err, resultCountWithSearch) {
          if(err) return console.error(err);

          // Array responsible for keep the data obtained by the method 'getAttributesTableData'
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
      });
    });
  };

  return getAttributesTableController;
};

module.exports = GetAttributesTableController;
