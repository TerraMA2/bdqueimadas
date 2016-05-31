"use strict";

/**
 * Controller responsible for export the fires data.
 * @class ExportController
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberQueimadasApi - Queimadas Api module.
 * @property {json} memberApiConfigurations - Api configurations.
 * @property {json} memberAttributesTableConfigurations - Attributes Table configurations.
 * @property {object} memberFs - 'fs' module.
 * @property {function} memberExec - Exec function.
 */
var ExportController = function(app) {

  // Queimadas Api module
  var memberQueimadasApi = new (require('../modules/QueimadasApi'))();
  // Api configurations
  var memberApiConfigurations = require('../configurations/Api');
  // Attributes Table configurations
  var memberAttributesTableConfigurations = require('../configurations/AttributesTable');
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

    var parameters = [
      {
        "Key": memberApiConfigurations.RequestsFields.GetFires.DateFrom,
        "Value": request.query.dateFrom
      },
      {
        "Key": memberApiConfigurations.RequestsFields.GetFires.DateTo,
        "Value": request.query.dateTo
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
    memberQueimadasApi.getData("GetFires", parameters, [], function(err, geoJson) {
      if(err) return console.error(err);

      geoJson = filterColumns(geoJson);

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
        } else {
          response.download(geoJsonPath, 'BDQueimadas-GeoJSON.json', function(err) {
            if(err) return console.error(err);

            memberFs.unlink(geoJsonPath);
          });
        }
      });
    });
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

  /**
   * Filter the table columns.
   * @param {GeoJSON} geoJsonOriginal - Received GeoJSON
   * @returns {GeoJSON} geoJson - Filtered GeoJSON
   *
   * @private
   * @function filterColumns
   * @memberof ExportController
   * @inner
   */
  var filterColumns = function(geoJsonOriginal) {
    var geoJson = JSON.parse(JSON.stringify(geoJsonOriginal));

    for(var i = 0; i < geoJson.features.length; i++) {
      var properties = {};

      memberAttributesTableConfigurations.Columns.forEach(function(column, index) {
        properties[column.Name] = geoJson.features[i].properties[column.Name];
      });

      geoJson.features[i].properties = properties;
    }

    return geoJson;
  };

  return exportController;
};

module.exports = ExportController;
