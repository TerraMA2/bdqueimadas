"use strict";

/**
 * Controller responsible for returning the attributes table data accordingly with the received parameters.
 * @class GetAttributesTableController
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberPath - 'path' module.
 * @property {object} memberAttributesTable - 'AttributesTable' model.
 * @property {object} memberQueimadasApi - Queimadas Api module.
 * @property {json} memberApiConfigurations - Api configurations.
 */
var GetAttributesTableController = function(app) {

  // 'path' module
  var memberPath = require('path');
  // 'AttributesTable' model
  var memberAttributesTable = new (require(memberPath.join(__dirname, '../models/AttributesTable')))();
  // Queimadas Api module
  var memberQueimadasApi = new (require(memberPath.join(__dirname, '../modules/QueimadasApi')))();
  // Api configurations
  var memberApiConfigurations = require(memberPath.join(__dirname, '../configurations/Api'));

  /**
   * Processes the request and returns a response.
   * @param {json} request - JSON containing the request data
   * @param {json} response - JSON containing the response data
   *
   * @function getAttributesTableController
   * @memberof GetAttributesTableController
   * @inner
   */
  var getAttributesTableController = function(request, response) {

    // Array responsible for keeping the query 'order by' field names and type (asc or desc)
    var order = [];

    // new


    var parameters = [
      {
        "Key": "inicio",
        "Value": request.body.dateFrom
      },
      {
        "Key": "fim",
        "Value": request.body.dateTo
      },
      {
        "Key": "limit",
        "Value": request.body.length
      },
      {
        "Key": "offset",
        "Value": request.body.start
      }
    ];

    // Verifications of the 'options' object items
    if(request.body.satellite !== '') {
      parameters.push({
        "Key": "satelite",
        "Value": request.body.satellite
      });
    }

    if(request.body.extent !== '') {
      parameters.push({
        "Key": "extent",
        "Value": request.body.extent
      });
    }

    if(request.body.country !== null && request.body.country !== '') {
      parameters.push({
        "Key": "pais",
        "Value": request.body.country
      });
    }

    if(request.body.state !== null && request.body.state !== '') {
      parameters.push({
        "Key": "estado",
        "Value": request.body.state
      });
    }

    memberQueimadasApi.getData(
      "GetFires",
      parameters,
      [],
      function(err, result) {
        if(err) return console.error(err);

        // Array responsible for keeping the data obtained by the method 'getAttributesTableData'
        var data = [];

        result.features.forEach(function(val){
          val = val.properties;

          var temp = [];
          for(var key in val) temp.push(val[key]);
          data.push(temp);
        });

        // JSON response
        response.json({
          draw: parseInt(request.body.draw),
          recordsTotal: result.features.length,
          recordsFiltered: result.features.length,
          data: data
        });
      }
    );



    // new




    /*// Setting of the 'order' array, the fields names are obtained by the columns numbers
    var arrayFound = request.body.columns.filter(function(item) {
      for(var i = 0; i < request.body.order.length; i++) {
        if(item.data === request.body.order[i].column)
          order.push({ "column": item.name, "dir": request.body.order[i].dir });
      }
    });

    // Call of the method 'getAttributesTableData', responsible for returning data of the attributes table accordingly with the request parameters
    memberAttributesTable.getAttributesTableData(request.body.length, request.body.start, order, request.body.search.value, request.body.dateFrom, request.body.dateTo, options, function(err, result) {
      if(err) return console.error(err);

      // Call of the method 'getAttributesTableCount', responsible for returning the number of rows of the attributes table accordingly with the request parameters, not considering the table search
      memberAttributesTable.getAttributesTableCount(request.body.dateFrom, request.body.dateTo, options, function(err, resultCount) {
        if(err) return console.error(err);

        // Call of the method 'getAttributesTableCount', responsible for returning the number of rows of the attributes table accordingly with the request parameters, considering the table search
        memberAttributesTable.getAttributesTableCountWithSearch(request.body.dateFrom, request.body.dateTo, request.body.search.value, options, function(err, resultCountWithSearch) {
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
      });
    });*/
  };

  return getAttributesTableController;
};

module.exports = GetAttributesTableController;
