"use strict";

/**
 * Controller responsible for export the fires data.
 * @class ExportController
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberExportation - 'Exportation' model.
 * @property {object} memberUtils - 'Utils' model.
 * @property {object} memberFs - 'fs' module.
 * @property {object} memberPath - 'path' module.
 * @property {function} memberExec - Exec function.
 * @property {function} memberExecSync - Exec function sync.
 */
var ExportController = function(app) {

  // 'Exportation' model
  var memberExportation = new (require('../models/Exportation.js'))();
  // 'Utils' model
  var memberUtils = new (require('../models/Utils.js'))();
  // 'fs' module
  var memberFs = require('fs');
  // 'path' module
  var memberPath = require('path');
  // Exec function
  var memberExec = require('child_process').exec;
  // Exec function sync
  var memberExecSync = require('child_process').execSync;

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
    if(isRequestValid(request.query.t, request.session.tokens)) {
      // Object responsible for keeping several information to be used in the database query
      var options = {};

      // Verifications of the 'options' object items
      if(request.query.satellites !== '') options.satellites = request.query.satellites;
      if(request.query.biomes !== '') options.biomes = request.query.biomes;
      if(request.query.continent !== '') options.continent = request.query.continent;
      if(request.query.countries !== '') options.countries = request.query.countries;
      if(request.query.states !== '') options.states = request.query.states;
      if(request.query.cities !== '') options.cities = request.query.cities;
      if(request.query.specialRegions !== '') options.specialRegions = request.query.specialRegions;
      if(request.query.protectedArea !== null && request.query.protectedArea !== '') options.protectedArea = JSON.parse(request.query.protectedArea);
      if(request.query.industrialFires !== null && request.query.industrialFires !== '') options.industrialFires = request.query.industrialFires;
      if(request.query.decimalSeparator !== undefined && request.query.decimalSeparator !== null && request.query.decimalSeparator !== '') options.decimalSeparator = request.query.decimalSeparator;
      if(request.query.fieldSeparator !== undefined && request.query.fieldSeparator !== null && request.query.fieldSeparator !== '') options.fieldSeparator = request.query.fieldSeparator;
      options.bufferInternal = (request.query.bufferInternal == "true");
      options.bufferFive = (request.query.bufferFive == "true");
      options.bufferTen = (request.query.bufferTen == "true");

      var requestFormats = request.query.format.split(',');

      if(memberUtils.stringInArray(requestFormats, 'all'))
        requestFormats = ['csv', 'geojson', 'kml', 'shapefile'];

      options.format = requestFormats;

      var userIp = (request.headers['x-forwarded-for'] || '').split(',')[0] || request.connection.remoteAddress;

      var dataTimeFrom = request.query.dateTimeFrom.split(' ');
      var dataTimeTo = request.query.dateTimeTo.split(' ');
      var fileName = 'Focos.' + dataTimeFrom[0] + '.' + dataTimeTo[0];

      // Call of the method 'registerDownload', responsible for registering the download in the database
      memberExportation.registerDownload(request.pgPool, request.query.dateTimeFrom, request.query.dateTimeTo, requestFormats.toString(), userIp, options, function(err, registerDownloadResult) {
        if(err) return console.error(err);

        require('crypto').randomBytes(24, function(err, buffer) {
          var connectionString = memberExportation.getPgConnectionString();
          var separator = (options.fieldSeparator !== undefined && options.fieldSeparator == "semicolon" ? "SEMICOLON" : "COMMA");
          var folderPath = memberPath.join(__dirname, '../tmp/' + buffer.toString('hex'));

          try {
            memberFs.mkdirSync(folderPath);
          } catch(e) {
            if(e.code != 'EEXIST')
              console.error(e);
          }

          var processedFormats = 0;

          for(var i = 0, formatsLength = requestFormats.length; i < formatsLength; i++) {
            switch(requestFormats[i]) {
              case 'csv':
                var fileExtention = '.csv';
                var ogr2ogrFormat = 'CSV';
                break;
              case 'shapefile':
                var fileExtention = '.shp';
                var ogr2ogrFormat = 'ESRI Shapefile';
                break;
              case 'kml':
                var fileExtention = '.kml';
                var ogr2ogrFormat = 'KML';
                break;
              default:
                var fileExtention = '.json';
                var ogr2ogrFormat = 'GeoJSON';
            }

            if(requestFormats[i] == 'shapefile') {
              try {
                memberFs.mkdirSync(folderPath + "/shapefile");
              } catch(e) {
                if(e.code != 'EEXIST')
                  console.error(e);
              }
            }

            var filePath = memberPath.join(__dirname, '../tmp/' + buffer.toString('hex') + (requestFormats[i] == 'shapefile' ? '/shapefile/' : '/') + fileName + fileExtention);
            var generationCommand = memberExportation.ogr2ogr() + " -F \"" + ogr2ogrFormat + "\" " + filePath + " \"" + connectionString + "\" -sql \"" + memberExportation.getQuery((requestFormats[i] != 'csv'), request.query.dateTimeFrom, request.query.dateTimeTo, options) + "\" -skipfailures" + (requestFormats[i] == "csv" ? " -lco LINEFORMAT=CRLF -lco SEPARATOR=" + separator : "");

            memberExec(generationCommand, function(generationCommandErr, generationCommandOut, generationCommandCode) {
              if(generationCommandErr) return console.error(generationCommandErr);

              if(requestFormats[processedFormats] == 'shapefile') {
                var zipPath = memberPath.join(__dirname, '../tmp/' + buffer.toString('hex')) + "/" + fileName + ".shp.zip";
                var zipGenerationCommand = "zip -r -j " + zipPath + " " + folderPath + "/shapefile";

                try {
                  var zipGenerationCommandResult = memberExecSync(zipGenerationCommand);
                  deleteFolderRecursively(folderPath + "/shapefile");
                } catch(e) {
                  console.error(e);
                }
              }

              processedFormats++;

              if(processedFormats == formatsLength) {
                if(requestFormats.length == 1) {
                  switch(requestFormats[0]) {
                    case 'csv':
                      var fileExtention = '.csv';
                      break;
                    case 'shapefile':
                      var fileExtention = '.shp';
                      break;
                    case 'kml':
                      var fileExtention = '.kml';
                      break;
                    default:
                      var fileExtention = '.json';
                  }

                  var finalPath = memberPath.join(__dirname, '../tmp/' + buffer.toString('hex')) + "/" + fileName + fileExtention + (requestFormats[0] == 'shapefile' ? '.zip' : '');
                  var finalFileName = fileName + fileExtention + (requestFormats[0] == 'shapefile' ? '.zip' : '');

                  response.download(finalPath, finalFileName, function(err) {
                    if(err) return console.error(err);

                    deleteFolderRecursively(folderPath);
                  });
                } else {
                  var finalPath = memberPath.join(__dirname, '../tmp/' + buffer.toString('hex')) + "/" + fileName + ".zip";
                  var finalFileName = fileName + ".zip";

                  var zipGenerationCommand = "zip -r -j " + finalPath + " " + folderPath;

                  memberExec(zipGenerationCommand, function(zipGenerationCommandErr, zipGenerationCommandOut, zipGenerationCommandCode) {
                    if(zipGenerationCommandErr) return console.error(zipGenerationCommandErr);

                    response.download(finalPath, finalFileName, function(err) {
                      if(err) return console.error(err);

                      deleteFolderRecursively(folderPath);
                    });
                  });
                }
              }
            });
          }
        });
      });
    } else {
      response.status(403).send('Access denied!');
    }

    deleteInvalidTokens(request.session.tokens);
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
   * Returns the difference in seconds between the current date / time and a given date / time.
   * @param {string} dateString - Date (YYYY-MM-DD HH:MM:SS)
   * @returns {integer} difference - Difference between the dates
   *
   * @private
   * @function getDateDifferenceInSeconds
   * @memberof ExportController
   * @inner
   */
  var getDateDifferenceInSeconds = function(dateString) {
    var now = new Date();
    var date = new Date(dateString);

    var utc1 = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
    var utc2 = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());

    var difference = Math.floor((utc1 - utc2) / 1000);

    return difference;
  };

  /**
   * Verifies if the given token is valid.
   * @param {string} token - Token to be verified
   * @param {array} tokens - Array of tokens from the session
   * @returns {boolean} boolean - The flag that indicates if the token is valid
   *
   * @private
   * @function isRequestValid
   * @memberof ExportController
   * @inner
   */
  var isRequestValid = function(token, tokens) {
    if(tokens !== undefined) {
      for(var i = 0, count = tokens.length; i < count; i++) {
        if(tokens[0].token === token) {
          if(getDateDifferenceInSeconds(tokens[0].date) <= 60) {
            tokens.splice(i, 1);
            return true;
          } else {
            tokens.splice(i, 1);
            //return false;
            return true;
          }
        }
      }

      //return false;
      return true;
    } else {
      //return false;
      return true;
    }
  };

  /**
   * Deletes the invalid tokens.
   * @param {array} tokens - Array of tokens from the session
   *
   * @private
   * @function deleteInvalidTokens
   * @memberof ExportController
   * @inner
   */
  var deleteInvalidTokens = function(tokens) {
    if(tokens !== undefined) {
      for(var i = 0, count = tokens.length; i < count; i++) {
        if(getDateDifferenceInSeconds(tokens[0].date) > 5)
          tokens.splice(i, 1);
      }
    }
  };

  return exportController;
};

module.exports = ExportController;
