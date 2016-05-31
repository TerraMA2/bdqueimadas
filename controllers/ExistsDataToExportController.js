"use strict";

/**
 * Controller responsible for verify if there is fires data to export.
 * @class ExistsDataToExportController
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberQueimadasApi - Queimadas Api module.
 * @property {json} memberApiConfigurations - Api configurations.
 */
var ExistsDataToExportController = function(app) {

  // Queimadas Api module
  var memberQueimadasApi = new (require('../modules/QueimadasApi'))();
  // Api configurations
  var memberApiConfigurations = require('../configurations/Api');

  /**
   * Processes the request and returns a response.
   * @param {json} request - JSON containing the request data
   * @param {json} response - JSON containing the response data
   *
   * @function existsDataToExportController
   * @memberof ExistsDataToExportController
   * @inner
   */
  var existsDataToExportController = function(request, response) {
    var parameters = [
      {
        "Key": memberApiConfigurations.RequestsFields.GetFires.DateFrom,
        "Value": request.query.dateFrom
      },
      {
        "Key": memberApiConfigurations.RequestsFields.GetFires.DateTo,
        "Value": request.query.dateTo
      },
      {
        "Key": memberApiConfigurations.RequestsFields.GetFires.Limit,
        "Value": 1
      }
    ];

    // Verifications of the parameters
    if(request.query.satellite !== '') {
      parameters.push({
        "Key": memberApiConfigurations.RequestsFields.GetFires.Satellite,
        "Value": request.query.satellite
      });
    }

    if(request.query.extent !== '') {
      parameters.push({
        "Key": memberApiConfigurations.RequestsFields.GetFires.Extent,
        "Value": request.query.extent.split(',')
      });
    }

    if(request.query.country !== null && request.query.country !== '') {
      parameters.push({
        "Key": memberApiConfigurations.RequestsFields.GetFires.Country,
        "Value": request.query.country
      });
    }

    if(request.query.state !== null && request.query.state !== '') {
      parameters.push({
        "Key": memberApiConfigurations.RequestsFields.GetFires.State,
        "Value": request.query.state
      });
    }

    // Call of the API method 'GetFires', responsible for returning the fires data in GeoJSON format
    memberQueimadasApi.getData("GetFires", parameters, [], function(err, GeoJSONData) {
      if(err) return console.error(err);

      // JSON response
      response.json({
        existsDataToExport: GeoJSONData.features.length > 0
      });
    });
  };

  return existsDataToExportController;
};

module.exports = ExistsDataToExportController;
