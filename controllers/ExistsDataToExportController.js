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
    if(request.body.satellites !== '') options.satellites = request.body.satellites;
    if(request.body.biomes !== '') options.biomes = request.body.biomes;
    if(request.body.countries !== '') options.countries = request.body.countries;
    if(request.body.states !== '') options.states = request.body.states;
    if(request.body.cities !== '') options.cities = request.body.cities;
    options.limit = 1;

    // Call of the method 'getGeoJSONData', responsible for returning the fires data in GeoJSON format
    memberExportation.getGeoJSONData(request.body.dateFrom, request.body.dateTo, options, function(err, GeoJSONData) {
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
