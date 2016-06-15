"use strict";

/**
 * Controller responsible for verify if there is fires data to export.
 * @class ExistsDataToExportController
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberExportation - 'Exportation' model.
 */
var ExistsDataToExportController = function(app) {

  // 'Exportation' model
  var memberExportation = new (require('../models/Exportation.js'))();

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
    // Object responsible for keeping several information to be used in the database query
    var options = {};

    // Verifications of the 'options' object items
    if(request.query.satellites !== '') options.satellites = request.query.satellites;
    if(request.query.extent !== '') options.extent = request.query.extent.split(',');
    if(request.query.country !== '') options.country = request.query.country;
    if(request.query.state !== '') options.state = request.query.state;
    options.limit = 1;

    // Call of the method 'getGeoJSONData', responsible for returning the fires data in GeoJSON format
    memberExportation.getGeoJSONData(request.query.dateFrom, request.query.dateTo, options, function(err, GeoJSONData) {
      if(err) return console.error(err);

      // JSON response
      response.json({
        existsDataToExport: GeoJSONData.rowCount > 0
      });
    });
  };

  return existsDataToExportController;
};

module.exports = ExistsDataToExportController;
