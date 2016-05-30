"use strict";

/**
 * Controller responsible for verify if there is fires data to export.
 * @class ExistsDataToExportController
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberQueimadasApi - Queimadas Api module.
 */
var ExistsDataToExportController = function(app) {

  // Queimadas Api module
  var memberQueimadasApi = new (require('../modules/QueimadasApi'))();

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
        "Key": "inicio",
        "Value": request.query.dateFrom
      },
      {
        "Key": "fim",
        "Value": request.query.dateTo
      },
      {
        "Key": "limit",
        "Value": 1
      }
    ];

    // Verifications of the parameters
    if(request.query.satellite !== '') {
      parameters.push({
        "Key": "satelite",
        "Value": request.query.satellite
      });
    }

    if(request.query.extent !== '') {
      parameters.push({
        "Key": "extent",
        "Value": request.query.extent.split(',')
      });
    }

    if(request.query.country !== null && request.query.country !== '') {
      parameters.push({
        "Key": "pais",
        "Value": request.query.country
      });
    }

    if(request.query.state !== null && request.query.state !== '') {
      parameters.push({
        "Key": "estado",
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
