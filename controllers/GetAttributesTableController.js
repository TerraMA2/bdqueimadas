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
    // Variable responsible for keeping the search string
    var search = "";

    var parameters = [
      {
        "Key": "inicio",
        "Value": request.body.dateFrom
      },
      {
        "Key": "fim",
        "Value": request.body.dateTo
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
      "GetFiresCount",
      parameters,
      [],
      function(err, count) {
        if(err) return console.error(err);

        parameters.push({
          "Key": "limit",
          "Value": parseInt(request.body.start) + parseInt(request.body.length)
        });

        parameters.push({
          "Key": "offset",
          "Value": parseInt(request.body.start)
        });

        // Setting of the 'order' array and the search string, the fields names are obtained by the columns numbers
        request.body.columns.forEach(function(column) {
          for(var i = 0; i < request.body.order.length; i++) {
            if(column.data === request.body.order[i].column) {
              order.push((request.body.order[i].dir === 'asc' ? '' : '-') + column.name);
            }
          }

          if(column.search.value !== '') search += column.name + ':' + column.search.value + ',';
        });

        search = search.slice(0, -1);

        parameters.push({
          "Key": "pesquisa",
          "Value": search
        });

        memberQueimadasApi.getData(
          "GetFiresCount",
          parameters,
          [],
          function(err, countWithSearch) {
            if(err) return console.error(err);

            parameters.push({
              "Key": "orientar",
              "Value": order
            });

            memberQueimadasApi.getData(
              "GetFires",
              parameters,
              [],
              function (err, result) {
                if (err) return console.error(err);

                // Array responsible for keeping the data obtained by the method 'getAttributesTableData'
                var data = [];

                result.features.forEach(function (val) {
                  val = val.properties;

                  var temp = [];

                  request.body.columns.forEach(function(column) {
                    temp.push(val[column.name]);
                  });

                  data.push(temp);
                });

                // JSON response
                response.json({
                  draw: parseInt(request.body.draw),
                  recordsTotal: count,
                  recordsFiltered: countWithSearch,
                  data: data
                });
              }
            );
          }
        );
      }
    );
  };

  return getAttributesTableController;
};

module.exports = GetAttributesTableController;
