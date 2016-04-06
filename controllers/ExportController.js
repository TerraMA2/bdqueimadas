"use strict";

/**
 * Controller responsible for export the fires data.
 * @class ExportController
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberExportation - 'Exportation' model.
 * @property {object} memberFs - 'fs' module.
 * @property {function} memberExec - Exec function.
 */
var ExportController = function(app) {

  // 'Exportation' model
  var memberExportation = new (require('../models/Exportation.js'))();
  // 'fs' module
  var memberFs = require('fs');
  // Exec function
  var memberExec = require('child_process').exec;

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

      var path = require('path');
      var jsonfile = require('jsonfile');

      require('crypto').randomBytes(24, function(err, buffer) {
        var GeoJSONPath = path.join(__dirname, '../tmp/geojson-' + buffer.toString('hex') + '.json');

        jsonfile.writeFileSync(GeoJSONPath, GeoJSON);

        if(request.query.format === 'shapefile') {
          var ShapefileFolderName = 'Shapefile-' + buffer.toString('hex');
          var ShapefileFolderPath = path.join(__dirname, '../tmp/' + ShapefileFolderName);
          var ShapefilePath = path.join(__dirname, '../tmp/' + ShapefileFolderName + '/BDQueimadas-Shapefile.shp');

          var ZipPath = path.join(__dirname, '../tmp/' + ShapefileFolderName) + "/BDQueimadas-Shapefile.zip";

          var shapefileGenerationCommand = "ogr2ogr -F \"ESRI Shapefile\" " + ShapefilePath + " " + GeoJSONPath + " OGRGeoJSON";
          var zipGenerationCommand = "zip -r -j " + ZipPath + " " + ShapefileFolderPath;

          try {
            memberFs.mkdirSync(ShapefileFolderPath);
          } catch(e) {
            if(e.code != 'EEXIST') throw e;
          }

          memberExec(shapefileGenerationCommand, function(err, shapefileGenerationCommandResult, shapefileGenerationCommandError) {
            if(err) return console.error(err);
            memberExec(zipGenerationCommand, function(err, zipGenerationCommandResult, zipGenerationCommandError) {
              if(err) return console.error(err);

              response.download(ZipPath, 'BDQueimadas-Shapefile.zip', function(err) {
                if(err) return console.error(err);

                memberFs.unlink(GeoJSONPath);
                deleteFolderRecursively(ShapefileFolderPath);
              });
            });
          });
        } else {
          response.download(GeoJSONPath, 'BDQueimadas-GeoJSON.json', function(err) {
            if(err) return console.error(err);

            memberFs.unlink(GeoJSONPath);
          });
        }
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

  /**
   * Deletes a folder and all its content.
   * @param {string} path - Path to the folder
   *
   * @private
   * @function deleteFolderRecursively
   * @memberof ExportController
   * @inner
   */
  var deleteFolderRecursively = function(path) {
    if(memberFs.existsSync(path)) {
      memberFs.readdirSync(path).forEach(function(file, index) {
        var currentPath = path + "/" + file;
        if(memberFs.lstatSync(currentPath).isDirectory()) {
          deleteFolderRecursively(currentPath);
        } else {
          memberFs.unlinkSync(currentPath);
        }
      });
      memberFs.rmdirSync(path);
    }
  };

  return exportController;
};

module.exports = ExportController;
