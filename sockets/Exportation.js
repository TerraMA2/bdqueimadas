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
 * @property {function} memberSpawn - Spawn function.
 * @property {function} memberGetUserIp - Function responsible for returning the user ip address.
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
  // Spawn function
  var memberSpawn = require('child_process').spawn;
  // Function responsible for returning the user ip address
  var memberGetUserIp = function(handshake) {
    var ip = null;

    if(handshake.headers !== undefined && handshake.headers['geoip_addr'] !== undefined)
      ip = handshake.headers.geoip_addr;

    if(ip === null && handshake.headers !== undefined && handshake.headers['x-forwarded-for'] !== undefined) {
      var ipArray = handshake.headers['x-forwarded-for'].split(', ');
      ip = ipArray[0];
    }

    if(ip === null && handshake.headers !== undefined && handshake.headers['x-real-ip'] !== undefined)
      ip = handshake.headers['x-real-ip'];

    if(ip === null && handshake.address !== undefined) {
      if(handshake.address.indexOf('::ffff:') !== -1)
        ip = handshake.address.replace('::ffff:', '');
      else
        ip = handshake.address;
    }

    if(ip === null)
      ip = "...";

    return ip;
  };

  // Socket connection event
  memberSockets.on('connection', function(client) {
    // Generate file request event
    client.on('generateFileRequest', function(json) {
      // Object responsible for keeping several information to be used in the database query
      var options = {};

      // Verifications of the 'options' object items
      if(json.satellites !== undefined && json.satellites !== null && json.satellites !== '') options.satellites = json.satellites;
      if(json.biomes !== undefined && json.biomes !== null && json.biomes !== '') options.biomes = json.biomes;
      if(json.continent !== undefined && json.continent !== null && json.continent !== '') options.continent = json.continent;
      if(json.countries !== undefined && json.countries !== null && json.countries !== '') options.countries = json.countries;
      if(json.states !== undefined && json.states !== null && json.states !== '') options.states = json.states;
      if(json.cities !== undefined && json.cities !== null && json.cities !== '') options.cities = json.cities;
      if(json.specialRegions !== undefined && json.specialRegions !== null && json.specialRegions !== '') options.specialRegions = json.specialRegions;
      if(json.protectedArea !== undefined && json.protectedArea !== null && json.protectedArea !== '') options.protectedArea = json.protectedArea;
      if(json.industrialFires !== undefined && json.industrialFires !== null && json.industrialFires !== '') options.industrialFires = json.industrialFires;
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

      var userIp = memberGetUserIp(client.handshake);

      // Call of the method 'registerDownload', responsible for registering the download in the database
      memberExportation.registerDownload(json.dateTimeFrom, json.dateTimeTo, requestFormats.toString(), userIp, options, function(err, registerDownloadResult) {
        if(err) return console.error(err);

        require('crypto').randomBytes(24, function(err, buffer) {
          var today = new Date();

          var dd = today.getDate();
          var mm = today.getMonth() + 1;
          var yyyy = today.getFullYear();

          if(dd < 10) dd = '0' + dd;
          if(mm < 10) mm = '0' + mm;

          var todayString = yyyy + '-' + mm + '-' + dd;
          var filesFolder = buffer.toString('hex') + '_--_' + todayString;

          var connectionString = memberExportation.getPgConnectionString();
          var separator = (options.fieldSeparator !== undefined && options.fieldSeparator == "semicolon" ? "SEMICOLON" : "COMMA");
          var folderPath = memberPath.join(__dirname, '../tmp/' + filesFolder);

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

            var ogr2ogr = memberExportation.ogr2ogr();
            var filePath = memberPath.join(__dirname, '../tmp/' + filesFolder + (requestFormats[i] == 'shapefile' ? '/shapefile/' : '/') + fileName + fileExtention);
            var args = ['-progress', '-F', ogr2ogrFormat, filePath, connectionString, '-sql', memberExportation.getQuery((requestFormats[i] != 'csv'), json.dateTimeFrom, json.dateTimeTo, options), '-skipfailures'];

            if(requestFormats[i] == "csv")
              args.push('-lco', 'LINEFORMAT=CRLF', '-lco', 'SEPARATOR=' + separator);

            var spawnCommand = memberSpawn(ogr2ogr, args);

            spawnCommand.stdout.on('data', function(data) {
              if(progress === null)
                progress = 0;
              else
                progress += progressStep;

              client.emit('generateFileResponse', { progress: progress });
            });

            spawnCommand.stderr.on('data', function(data) {
              console.error(err);
            });

            spawnCommand.on('error', function(err) {
              console.error(err);
            });

            spawnCommand.on('exit', function(code) {
              processedFormats++;

              if(processedFormats == formatsLength) {
                var finalizeProcess = function() {
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

                    var finalPath = memberPath.join(__dirname, '../tmp/' + filesFolder) + "/" + fileName + fileExtention + (requestFormats[0] == 'shapefile' ? '.zip' : '');
                    var finalFileName = fileName + fileExtention + (requestFormats[0] == 'shapefile' ? '.zip' : '');

                    client.emit('generateFileResponse', { 
                      folder: filesFolder,
                      file: finalFileName
                    });
                  } else {
                    var finalPath = memberPath.join(__dirname, '../tmp/' + filesFolder) + "/" + fileName + ".zip";
                    var finalFileName = fileName + ".zip";

                    var zipGenerationCommand = "zip -r -j " + finalPath + " " + folderPath;

                    memberExec(zipGenerationCommand, function(zipGenerationCommandErr, zipGenerationCommandOut, zipGenerationCommandCode) {
                      if(zipGenerationCommandErr) return console.error(zipGenerationCommandErr);

                      client.emit('generateFileResponse', { 
                        folder: filesFolder,
                        file: finalFileName
                      });
                    });
                  }
                };

                if(memberUtils.stringInArray(requestFormats, 'shapefile')) {
                  var zipPath = memberPath.join(__dirname, '../tmp/' + filesFolder) + "/" + fileName + ".shp.zip";
                  var zipGenerationCommand = "zip -r -j " + zipPath + " " + folderPath + "/shapefile";

                  try {
                    var zipGenerationCommandResult = memberExecSync(zipGenerationCommand);
                    memberUtils.deleteFolderRecursively(folderPath + "/shapefile", finalizeProcess);
                  } catch(e) {
                    console.error(e);
                  }
                } else {
                  finalizeProcess();
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
      if(json.satellites !== undefined && json.satellites !== null && json.satellites !== '') options.satellites = json.satellites;
      if(json.biomes !== undefined && json.biomes !== null && json.biomes !== '') options.biomes = json.biomes;
      if(json.continent !== undefined && json.continent !== null && json.continent !== '') options.continent = json.continent;
      if(json.countries !== undefined && json.countries !== null && json.countries !== '') options.countries = json.countries;
      if(json.states !== undefined && json.states !== null && json.states !== '') options.states = json.states;
      if(json.cities !== undefined && json.cities !== null && json.cities !== '') options.cities = json.cities;
      if(json.specialRegions !== undefined && json.specialRegions !== null && json.specialRegions !== '') options.specialRegions = json.specialRegions;
      if(json.protectedArea !== undefined && json.protectedArea !== null && json.protectedArea !== '') options.protectedArea = json.protectedArea;
      if(json.industrialFires !== undefined && json.industrialFires !== null && json.industrialFires !== '') options.industrialFires = json.industrialFires;
      options.limit = 1;
      options.bufferInternal = (json.bufferInternal == "true");
      options.bufferFive = (json.bufferFive == "true");
      options.bufferTen = (json.bufferTen == "true");

      // Call of the method 'getGeoJSONData', responsible for returning the fires data in GeoJSON format
      memberExportation.getGeoJSONData(json.dateTimeFrom, json.dateTimeTo, options, function(err, GeoJSONData) {
        if(err) return console.error(err);

        client.emit('existsDataToExportResponse', { existsDataToExport: GeoJSONData.rowCount > 0 });
      });
    });
  });
};

module.exports = Exportation;
