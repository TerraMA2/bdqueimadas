"use strict";

/**
 * Socket responsible for generating files for the exportation of fires data.
 * @class Exportation
 * @variation 2
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberSockets - Sockets object.
 * @property {object} memberExportation - 'Exportation' model.
 * @property {object} memberUtils - 'Utils' model.
 * @property {object} memberFs - 'fs' module.
 * @property {object} memberPath - 'path' module.
 * @property {function} memberExec - Exec function.
 * @property {function} memberExecSync - Exec function sync.
 */
var Exportation = function(io) {

  // Sockets object
  var memberSockets = io.sockets;
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

  // Socket connection event
  memberSockets.on('connection', function(client) {
    // Generate file request event
    client.on('generateFileRequest', function(json) {
      // Object responsible for keeping several information to be used in the database query
      var options = {};

      // Verifications of the 'options' object items
      if(json.satellites !== '') options.satellites = json.satellites;
      if(json.biomes !== '') options.biomes = json.biomes;
      if(json.continent !== '') options.continent = json.continent;
      if(json.countries !== '') options.countries = json.countries;
      if(json.states !== '') options.states = json.states;
      if(json.cities !== '') options.cities = json.cities;
      if(json.specialRegions !== '') options.specialRegions = json.specialRegions;
      if(json.protectedArea !== null && json.protectedArea !== '') options.protectedArea = JSON.parse(json.protectedArea);
      if(json.industrialFires !== null && json.industrialFires !== '') options.industrialFires = json.industrialFires;
      if(json.decimalSeparator !== undefined && json.decimalSeparator !== null && json.decimalSeparator !== '') options.decimalSeparator = json.decimalSeparator;
      if(json.fieldSeparator !== undefined && json.fieldSeparator !== null && json.fieldSeparator !== '') options.fieldSeparator = json.fieldSeparator;
      options.bufferInternal = (json.bufferInternal == "true");
      options.bufferFive = (json.bufferFive == "true");
      options.bufferTen = (json.bufferTen == "true");

      var requestFormats = json.format.split(',');

      if(memberUtils.stringInArray(requestFormats, 'all'))
        requestFormats = ['csv', 'geojson', 'kml', 'shapefile'];

      options.format = requestFormats;

      var dataTimeFrom = json.dateTimeFrom.split(' ');
      var dataTimeTo = json.dateTimeTo.split(' ');
      var fileName = 'Focos.' + dataTimeFrom[0] + '.' + dataTimeTo[0];

      var userIp = client.handshake.address;

      // Call of the method 'registerDownload', responsible for registering the download in the database
      memberExportation.registerDownload(client.pgPool, json.dateTimeFrom, json.dateTimeTo, requestFormats.toString(), userIp, options, function(err, registerDownloadResult) {
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
          var progress = null;
          var progressStep = 2.5 / requestFormats.length;

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
            //var generationCommand = memberExportation.ogr2ogr() + " -progress -F \"" + ogr2ogrFormat + "\" " + filePath + " \"" + connectionString + "\" -sql \"" + memberExportation.getQuery((requestFormats[i] != 'csv'), json.dateTimeFrom, json.dateTimeTo, options) + "\" -skipfailures" + (requestFormats[i] == "csv" ? " -lco LINEFORMAT=CRLF -lco SEPARATOR=" + separator : "");

            var commandString = memberExportation.ogr2ogr();
            var args = ['-progress', '-F', ogr2ogrFormat, filePath, connectionString, '-sql', memberExportation.getQuery((requestFormats[i] != 'csv'), json.dateTimeFrom, json.dateTimeTo, options), '-skipfailures'];

            if(requestFormats[i] == "csv")
              args.push('-lco', 'LINEFORMAT=CRLF', '-lco', 'SEPARATOR=' + separator);

            var spawn = require('child_process').spawn;
            var command = spawn(commandString, args);

            command.stdout.on('data', function(data) {
              if(progress === null)
                progress = 0;
              else
                progress += progressStep;

              client.emit('generateFileResponse', { progress: progress });
            });

            command.stderr.on('data', function(data) {
              console.log('stderr: ' + data.toString());
            });

            command.on('error', function(err) {
              console.log(err);
            });

            command.on('exit', function(code) {
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

                  client.emit('generateFileResponse', {  });
                } else {
                  var finalPath = memberPath.join(__dirname, '../tmp/' + buffer.toString('hex')) + "/" + fileName + ".zip";
                  var finalFileName = fileName + ".zip";

                  var zipGenerationCommand = "zip -r -j " + finalPath + " " + folderPath;

                  memberExec(zipGenerationCommand, function(zipGenerationCommandErr, zipGenerationCommandOut, zipGenerationCommandCode) {
                    if(zipGenerationCommandErr) return console.error(zipGenerationCommandErr);

                    client.emit('generateFileResponse', {  });
                  });
                }
              }
            });
          }
        });
      });
    });

    // Exists data to export request event
    client.on('existsDataToExportRequest', function(json) {
      // Object responsible for keeping several information to be used in the database query
      var options = {};

      // Verifications of the 'options' object items
      if(json.satellites !== '') options.satellites = json.satellites;
      if(json.biomes !== '') options.biomes = json.biomes;
      if(json.continent !== '') options.continent = json.continent;
      if(json.countries !== '') options.countries = json.countries;
      if(json.states !== '') options.states = json.states;
      if(json.cities !== '') options.cities = json.cities;
      if(json.specialRegions !== '') options.specialRegions = json.specialRegions;
      if(json.protectedArea !== null && json.protectedArea !== '') options.protectedArea = json.protectedArea;
      if(json.industrialFires !== null && json.industrialFires !== '') options.industrialFires = json.industrialFires;
      options.limit = 1;
      options.bufferInternal = (json.bufferInternal == "true");
      options.bufferFive = (json.bufferFive == "true");
      options.bufferTen = (json.bufferTen == "true");

      // Call of the method 'getGeoJSONData', responsible for returning the fires data in GeoJSON format
      memberExportation.getGeoJSONData(client.pgPool, json.dateTimeFrom, json.dateTimeTo, options, function(err, GeoJSONData) {
        if(err) return console.error(err);

        client.emit('existsDataToExportResponse', { existsDataToExport: GeoJSONData.rowCount > 0 });
      });
    });
  });

  /**
   * Deletes a folder and all its content.
   * @param {string} path - Path to the folder
   *
   * @private
   * @function deleteFolderRecursively
   * @memberof Exportation(2)
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
};

module.exports = Exportation;
