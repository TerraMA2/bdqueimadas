"use strict";

/**
 * Controller responsible for returning the attributes table data accordingly with the received parameters.
 * @class GetAttributesTableController
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberQueimadasApi - Queimadas Api module.
 * @property {json} memberApiConfigurations - Api configurations.
 */
var GetAttributesTableController = function(app) {

  // Queimadas Api module
  var memberQueimadasApi = new (require('../modules/QueimadasApi'))();
  // Api configurations
  var memberApiConfigurations = require('../configurations/Api');

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

    var parametersGetFiresCount = [
      {
        "Key": memberApiConfigurations.RequestsFields.GetFiresCount.DateFrom,
        "Value": request.body.dateFrom
      },
      {
        "Key": memberApiConfigurations.RequestsFields.GetFiresCount.DateTo,
        "Value": request.body.dateTo
      }
    ];

    var parametersGetFires = [
      {
        "Key": memberApiConfigurations.RequestsFields.GetFires.DateFrom,
        "Value": request.body.dateFrom
      },
      {
        "Key": memberApiConfigurations.RequestsFields.GetFires.DateTo,
        "Value": request.body.dateTo
      }
    ];

    // Verifications of the 'options' object items
    if(request.body.satellite !== '') {
      parametersGetFiresCount.push({
        "Key": memberApiConfigurations.RequestsFields.GetFiresCount.Satellite,
        "Value": request.body.satellite
      });

      parametersGetFires.push({
        "Key": memberApiConfigurations.RequestsFields.GetFires.Satellite,
        "Value": request.body.satellite
      });
    }

    if(request.body.extent !== '') {
      parametersGetFiresCount.push({
        "Key": memberApiConfigurations.RequestsFields.GetFiresCount.Extent,
        "Value": request.body.extent
      });

      parametersGetFires.push({
        "Key": memberApiConfigurations.RequestsFields.GetFires.Extent,
        "Value": request.body.extent
      });
    }

    if(request.body.country !== null && request.body.country !== '') {
      parametersGetFiresCount.push({
        "Key": memberApiConfigurations.RequestsFields.GetFiresCount.Country,
        "Value": request.body.country
      });

      parametersGetFires.push({
        "Key": memberApiConfigurations.RequestsFields.GetFires.Country,
        "Value": request.body.country
      });
    }

    if(request.body.state !== null && request.body.state !== '') {
      parametersGetFiresCount.push({
        "Key": memberApiConfigurations.RequestsFields.GetFiresCount.State,
        "Value": request.body.state
      });

      parametersGetFires.push({
        "Key": memberApiConfigurations.RequestsFields.GetFires.State,
        "Value": request.body.state
      });
    }

    memberQueimadasApi.getData(
      "GetFiresCount",
      parametersGetFiresCount,
      [],
      function(err, count) {
        if(err) return console.error(err);

        // Setting of the 'order' array and the search string, the fields names are obtained by the columns numbers
        request.body.columns.forEach(function(column) {
          for(var i = 0; i < request.body.order.length; i++) {
            if(column.data === request.body.order[i].column) {
              order.push((request.body.order[i].dir === 'asc' ? '' : '-') + column.name);
            }
          }

          if(column.search.value !== '') search += column.name + ':' + column.search.value + ',';
        });

        if(search !== "") {
          search = search.slice(0, -1);

          parametersGetFiresCount.push({
            "Key": memberApiConfigurations.RequestsFields.GetFiresCount.Search,
            "Value": search
          });

          parametersGetFires.push({
            "Key": memberApiConfigurations.RequestsFields.GetFires.Search,
            "Value": search
          });
        }

        memberQueimadasApi.getData(
          "GetFiresCount",
          parametersGetFiresCount,
          [],
          function(err, countWithSearch) {
            if(err) return console.error(err);

            parametersGetFires.push({
              "Key": memberApiConfigurations.RequestsFields.GetFires.Limit,
              "Value": parseInt(request.body.start) + parseInt(request.body.length)
            });

            parametersGetFires.push({
              "Key": memberApiConfigurations.RequestsFields.GetFires.Offset,
              "Value": parseInt(request.body.start)
            });

            parametersGetFires.push({
              "Key": memberApiConfigurations.RequestsFields.GetFires.Ordination,
              "Value": order
            });

            memberQueimadasApi.getData(
              "GetFires",
              parametersGetFires,
              [],
              function(err, result) {
                if(err) return console.error(err);

                // Array responsible for keeping the data obtained by the method 'getAttributesTableData'
                var data = [];

                result.features.forEach(function(val) {
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
