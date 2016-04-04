"use strict";

/**
 * Controller responsible for export the fires data.
 * @class ExportController
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberExportation - 'Exportation' model.
 */
var ExportController = function(app) {

  // 'Exportation' model
  var memberExportation = new (require('../models/Exportation.js'))();

  /**
   * Processes the request and returns a response.
   * @param {json} request - JSON containing the request data
   * @param {json} response - JSON containing the response data
   *
   * @function exportController
   * @memberof ExportController
   * @inner
   */
  var exportController = function(request, response) {

    // Object responsible for keep several information to be used in the database query
    var options = {};

    // Verifications of the 'options' object items
    if(request.query.satellite !== '') options.satellite = request.query.satellite;
    if(request.query.extent !== '') options.extent = request.query.extent.split(',');

    // Call of the method 'getGeoJSONData', responsible for returning the fires data in GeoJSON format
    memberExportation.getGeoJSONData(request.query.dateFrom, request.query.dateTo, options, function(err, GeoJSONData) {
      if(err) return console.error(err);

      var GeoJSON = createFeatureCollection(GeoJSONData);

      var fs = require('fs');
      var path = require('path');
      var jsonfile = require('jsonfile');

      require('crypto').randomBytes(24, function(err, buffer) {
        var file = path.join(__dirname, '../tmp/geojson-' + buffer.toString('hex') + '.json');

        jsonfile.writeFileSync(file, GeoJSON);

        response.download(file, 'BDQueimadas-GeoJSON.json', function(err) {
          if(err) return console.error(err);

          fs.unlink(file);
        });
      });
    });
  };

  /**
   * Processes the data returned from the database and creates a Feature Collection (GeoJSON).
   * @param {json} GeoJSONData - JSON containing the data returned from the database
   * @returns {geojson} GeoJSON - Feature Collection (GeoJSON)
   *
   * @private
   * @function createFeatureCollection
   * @memberof ExportController
   * @inner
   */
  var createFeatureCollection = function(GeoJSONData) {
    var GeoJSON = {
      "type": "FeatureCollection",
      "features": []
    };

    GeoJSONData.rows.forEach(function(feature) {
      GeoJSON.features.push({
        "type": "Feature",
        "geometry": feature.geometry,
        "properties": feature.properties
      });
    });

    return GeoJSON;
  };

  return exportController;
};

module.exports = ExportController;
