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
    // Object responsible for keeping several information to be used in the database query
    var options = {};

    // Verifications of the 'options' object items
    if(request.query.satellites !== '') options.satellites = request.query.satellites;
    if(request.query.biomes !== '') options.biomes = request.query.biomes;
    if(request.query.countries !== '') options.countries = request.query.countries;
    if(request.query.states !== '') options.states = request.query.states;
    if(request.query.cities !== '') options.cities = request.query.cities;

    var userIp = (request.headers['x-forwarded-for'] || '').split(',')[0] || request.connection.remoteAddress;

    // Call of the method 'registerDownload', responsible for registering the download in the database
    memberExportation.registerDownload(request.query.dateFrom, request.query.dateTo, request.query.format, userIp, options, function(err, registerDownloadResult) {
      if(err) return console.error(err);

      // Call of the method 'getGeoJSONData', responsible for returning the fires data in GeoJSON format
      memberExportation.getGeoJSONData(request.query.dateFrom, request.query.dateTo, options, function(err, geoJsonData) {
        if(err) return console.error(err);

        var geoJson = createFeatureCollection(geoJsonData);

        var path = require('path');
        var jsonfile = require('jsonfile');

        require('crypto').randomBytes(24, function(err, buffer) {
          var geoJsonPath = path.join(__dirname, '../tmp/geojson-' + buffer.toString('hex') + '.json');

          jsonfile.writeFileSync(geoJsonPath, geoJson);

          if(request.query.format === 'shapefile') {
            var shapefileFolderName = 'Shapefile-' + buffer.toString('hex');
            var shapefileFolderPath = path.join(__dirname, '../tmp/' + shapefileFolderName);
            var shapefilePath = path.join(__dirname, '../tmp/' + shapefileFolderName + '/BDQueimadas-Shapefile.shp');

            var zipPath = path.join(__dirname, '../tmp/' + shapefileFolderName) + "/BDQueimadas-Shapefile.zip";

            var shapefileGenerationCommand = "ogr2ogr -F \"ESRI Shapefile\" " + shapefilePath + " " + geoJsonPath + " OGRGeoJSON";
            var zipGenerationCommand = "zip -r -j " + zipPath + " " + shapefileFolderPath;

            try {
              memberFs.mkdirSync(shapefileFolderPath);
            } catch(e) {
              if(e.code != 'EEXIST') throw e;
            }

            memberExec(shapefileGenerationCommand, function(err, shapefileGenerationCommandResult, shapefileGenerationCommandError) {
              if(err) return console.error(err);

              memberExec(zipGenerationCommand, function(err, zipGenerationCommandResult, zipGenerationCommandError) {
                if(err) return console.error(err);

                response.download(zipPath, 'BDQueimadas-Shapefile.zip', function(err) {
                  if(err) return console.error(err);

                  memberFs.unlink(geoJsonPath);
                  deleteFolderRecursively(shapefileFolderPath);
                });
              });
            });
          } else if(request.query.format === 'csv') {
            var csvPath = path.join(__dirname, '../tmp/BDQueimadas-CSV.csv');
            var csvGenerationCommand = "ogr2ogr -F \"CSV\" " + csvPath + " " + geoJsonPath;

            memberExec(csvGenerationCommand, function(err, csvGenerationCommandResult, csvGenerationCommandError) {
              if(err) return console.error(err);

              response.download(csvPath, 'BDQueimadas-CSV.csv', function(err) {
                if(err) return console.error(err);

                memberFs.unlink(geoJsonPath);
                memberFs.unlink(csvPath);
              });
            });
          } else if(request.query.format === 'kml') {
            var kmlPath = path.join(__dirname, '../tmp/BDQueimadas-KML.kml');
            var kmlGenerationCommand = "ogr2ogr -F \"KML\" " + kmlPath + " " + geoJsonPath;

            memberExec(kmlGenerationCommand, function(err, kmlGenerationCommandResult, kmlGenerationCommandError) {
              if(err) return console.error(err);

              response.download(kmlPath, 'BDQueimadas-KML.kml', function(err) {
                if(err) return console.error(err);

                memberFs.unlink(geoJsonPath);
                memberFs.unlink(kmlPath);
              });
            });
          } else {
            response.download(geoJsonPath, 'BDQueimadas-GeoJSON.json', function(err) {
              if(err) return console.error(err);

              memberFs.unlink(geoJsonPath);
            });
          }
        });
      });
    });
  };

  /**
   * Processes the data returned from the database and creates a Feature Collection (GeoJSON).
   * @param {json} geoJsonData - JSON containing the data returned from the database
   * @returns {geojson} geoJson - Feature Collection (GeoJSON)
   *
   * @private
   * @function createFeatureCollection
   * @memberof ExportController
   * @inner
   */
  var createFeatureCollection = function(geoJsonData) {
    var geoJson = {
      "type": "FeatureCollection",
      "features": []
    };

    geoJsonData.rows.forEach(function(feature) {
      geoJson.features.push({
        "type": "Feature",
        "geometry": feature.geometry,
        "properties": feature.properties
      });
    });

    return geoJson;
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
