"use strict";

/**
 * Controller responsible for export the fires data.
 * @class ExportController
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberExportation - 'Exportation' model.
 * @property {object} memberFs - 'fs' module.
 * @property {object} memberPath - 'path' module.
 * @property {function} memberExec - Exec function.
 */
var ExportController = function(app) {

  // 'Exportation' model
  var memberExportation = new (require('../models/Exportation.js'))();
  // 'fs' module
  var memberFs = require('fs');
  // 'path' module
  var memberPath = require('path');
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
      if(request.query.decimalSeparator !== undefined && request.query.decimalSeparator !== null && request.query.decimalSeparator !== '') options.decimalSeparator = request.query.decimalSeparator;
      if(request.query.fieldSeparator !== undefined && request.query.fieldSeparator !== null && request.query.fieldSeparator !== '') options.fieldSeparator = request.query.fieldSeparator;
      options.bufferInternal = (request.query.bufferInternal == "true");
      options.bufferFive = (request.query.bufferFive == "true");
      options.bufferTen = (request.query.bufferTen == "true");
      options.encoding = request.query.encoding;
      options.format = request.query.format;

      var userIp = (request.headers['x-forwarded-for'] || '').split(',')[0] || request.connection.remoteAddress;

      // Call of the method 'registerDownload', responsible for registering the download in the database
      memberExportation.registerDownload(request.pgPool, request.query.dateTimeFrom, request.query.dateTimeTo, request.query.format, userIp, options, function(err, registerDownloadResult) {
        if(err) return console.error(err);

        require('crypto').randomBytes(24, function(err, buffer) {

          if(true) {
            var connectionString = memberExportation.getPgConnectionString();

            if(request.query.format === 'csv') {
              var separator = (options.fieldSeparator !== undefined && options.fieldSeparator == "semicolon" ? "SEMICOLON" : "COMMA");

              var csvPath = memberPath.join(__dirname, '../tmp/csv-' + buffer.toString('hex') + '.csv');
              var csvGenerationCommand = memberExportation.ogr2ogr() + " -F \"CSV\" " + csvPath + " \"" + connectionString + "\" -sql \"" + memberExportation.getQuery(false, request.query.dateTimeFrom, request.query.dateTimeTo, options) + "\" -skipfailures -lco SEPARATOR=" + separator;

              memberExec(csvGenerationCommand, function(err, csvGenerationCommandResult, csvGenerationCommandError) {
                if(err) return console.error(err);

                response.download(csvPath, 'BDQueimadas-CSV.' + request.query.dateTimeFrom.split(' ').join('_').split(':').join('-') + '.' + request.query.dateTimeTo.split(' ').join('_').split(':').join('-') + '.csv', function(err) {
                if(err) return console.error(err);

                memberFs.unlink(csvPath);
                });
              });
            } else if(request.query.format === 'shapefile') {
              var shapefileFolderName = 'Shapefile-' + buffer.toString('hex');
              var shapefileFolderPath = memberPath.join(__dirname, '../tmp/' + shapefileFolderName);
              var shapefilePath = memberPath.join(__dirname, '../tmp/' + shapefileFolderName + '/BDQueimadas-Shapefile.' + request.query.dateTimeFrom.split(' ').join('_').split(':').join('-') + '.' + request.query.dateTimeTo.split(' ').join('_').split(':').join('-') + '.shp');

              var zipPath = memberPath.join(__dirname, '../tmp/' + shapefileFolderName) + "/BDQueimadas-Shapefile." + request.query.dateTimeFrom.split(' ').join('_').split(':').join('-') + "." + request.query.dateTimeTo.split(' ').join('_').split(':').join('-') + ".zip";

              var shapefileGenerationCommand = memberExportation.ogr2ogr() + " -F \"ESRI Shapefile\" " + shapefilePath + " \"" + connectionString + "\" -sql \"" + memberExportation.getQuery(true, request.query.dateTimeFrom, request.query.dateTimeTo, options) + "\" -skipfailures";
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

                  response.download(zipPath, 'BDQueimadas-Shapefile.' + request.query.dateTimeFrom.split(' ').join('_').split(':').join('-') + '.' + request.query.dateTimeTo.split(' ').join('_').split(':').join('-') + '.zip', function(err) {
                    if(err) return console.error(err);

                    deleteFolderRecursively(shapefileFolderPath);
                  });
                });
              });
            } else if(request.query.format === 'kml') {
              var kmlPath = memberPath.join(__dirname, '../tmp/BDQueimadas-KML.' + request.query.dateTimeFrom.split(' ').join('_').split(':').join('-') + '.' + request.query.dateTimeTo.split(' ').join('_').split(':').join('-') + '.kml');
              var kmlGenerationCommand = memberExportation.ogr2ogr() + " -F \"KML\" " + kmlPath + " \"" + connectionString + "\" -sql \"" + memberExportation.getQuery(true, request.query.dateTimeFrom, request.query.dateTimeTo, options) + "\" -skipfailures";

              memberExec(kmlGenerationCommand, function(err, kmlGenerationCommandResult, kmlGenerationCommandError) {
                if(err) return console.error(err);

                response.download(kmlPath, 'BDQueimadas-KML.' + request.query.dateTimeFrom.split(' ').join('_').split(':').join('-') + '.' + request.query.dateTimeTo.split(' ').join('_').split(':').join('-') + '.kml', function(err) {
                  if(err) return console.error(err);

                  memberFs.unlink(kmlPath);
                });
              });
            } else {
              var geoJsonPath = memberPath.join(__dirname, '../tmp/geojson-' + buffer.toString('hex') + '.json');
              var geoJsonGenerationCommand = memberExportation.ogr2ogr() + " -F \"GeoJSON\" " + geoJsonPath + " \"" + connectionString + "\" -sql \"" + memberExportation.getQuery(true, request.query.dateTimeFrom, request.query.dateTimeTo, options) + "\" -skipfailures";

              memberExec(geoJsonGenerationCommand, function(err, geoJsonGenerationCommandResult, geoJsonGenerationCommandError) {
                if(err) return console.error(err);

                response.download(geoJsonPath, 'BDQueimadas-GeoJSON.' + request.query.dateTimeFrom.split(' ').join('_').split(':').join('-') + '.' + request.query.dateTimeTo.split(' ').join('_').split(':').join('-') + '.json', function(err) {
                  if(err) return console.error(err);

                  memberFs.unlink(geoJsonPath);
                });
              });
            /*} else if() {
              satelites = []
              satelites.append({'nome':'GOES-13'})
              satelites.append({'nome':'AQUA_M'})
              satelites.append({'nome':'TERRA_M'})
              satelites.append({'nome':'TERRA_M-T'})
              satelites.append({'nome':'MSG-02'})
              satelites.append({'nome':'NPP'})
              satelites.append({'nome':'NOAA-15'})
              satelites.append({'nome':'NOAA-18'})
              satelites.append({'nome':'NOAA-19'})
              satelites.append({'nome':'MSG-02'})
              satelites.append({'nome':'NPP'})
              satelites.append({'nome':'NPP_375'})

              arq_fonte = open("/tmp/" + arquivo, "r")
              arq_template = open(settings.MEDIA_ROOT + "/templates/template_kml.kml", "r")

              items = json.loads(arq_fonte.read())

              for stl in satelites:
                  dados_str += '<Folder>'
                  dados_str += '<name>%s</name>' %(stl.get('nome'))

                  items_focos = items.get('features')

                  for it in items_focos:
                      propriedades = it.get('properties')
                      if propriedades.get('satelite') == stl.get('nome'):
                          dados_str += '<Placemark>'
                          dados_str += '<name>%s</name>' %(stl.get('nome'))
                          dados_str += '<description><![CDATA[<br>LAT =  %s<br>LONG =  %s<br>DATA = %s<br>SATELITE = %s<br>ESTADO =%s<br>VERSION = 1.0NRT<br><br>]]></description>' %(propriedades.get('latitude'),propriedades.get('longitude'),propriedades.get('data_hora_gmt'),propriedades.get('satelite').decode('utf-8').strip(),propriedades.get('estado').decode('utf-8').strip())
                          dados_str += '<styleUrl>#%s</styleUrl>' %(stl.get('nome'))
                          dados_str += '<Point>'
                          dados_str += '<coordinates>%s,%s</coordinates>' %(propriedades.get('longitude'),propriedades.get('latitude'))
                          dados_str += '</Point>'
                          dados_str += '<LookAt>'
                          dados_str += '<longitude>%s</longitude>'%(propriedades.get('longitude'))
                          dados_str += '<latitude>%s</latitude>'%(propriedades.get('latitude'))
                          dados_str += '<range>5000</range>'
                          dados_str += '</LookAt>'
                          dados_str += '</Placemark>'
                  dados_str += '</Folder>'

              dados = str(arq_template.read()).replace('||MIOLO||',dados_str).decode('utf-8').strip()

              with codecs.open("/tmp/" + filename + ".kml",'w',encoding='utf-8') as f:
                  f.write(dados.decode('utf-8')) ''*/
            }
          } else {
            // Call of the method 'getGeoJSONData', responsible for returning the fires data in GeoJSON format
            memberExportation.getGeoJSONData(request.pgPool, request.query.dateTimeFrom, request.query.dateTimeTo, options, function(err, geoJsonData) {
              if(err) return console.error(err);

              var geoJson = createFeatureCollection(geoJsonData);

              var jsonfile = require('jsonfile');

              var geoJsonPath = memberPath.join(__dirname, '../tmp/geojson-' + buffer.toString('hex') + '.json');

              jsonfile.writeFileSync(geoJsonPath, geoJson);

              if(request.query.format === 'shapefile') {
                var shapefileFolderName = 'Shapefile-' + buffer.toString('hex');
                var shapefileFolderPath = memberPath.join(__dirname, '../tmp/' + shapefileFolderName);
                var shapefilePath = memberPath.join(__dirname, '../tmp/' + shapefileFolderName + '/BDQueimadas-Shapefile.' + request.query.dateTimeFrom.split(' ').join('_').split(':').join('-') + '.' + request.query.dateTimeTo.split(' ').join('_').split(':').join('-') + '.shp');

                var zipPath = memberPath.join(__dirname, '../tmp/' + shapefileFolderName) + "/BDQueimadas-Shapefile." + request.query.dateTimeFrom.split(' ').join('_').split(':').join('-') + "." + request.query.dateTimeTo.split(' ').join('_').split(':').join('-') + ".zip";

                var shapefileGenerationCommand = memberExportation.ogr2ogr() + " -F \"ESRI Shapefile\" " + shapefilePath + " " + geoJsonPath + " OGRGeoJSON";
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

                    response.download(zipPath, 'BDQueimadas-Shapefile.' + request.query.dateTimeFrom.split(' ').join('_').split(':').join('-') + '.' + request.query.dateTimeTo.split(' ').join('_').split(':').join('-') + '.zip', function(err) {
                      if(err) return console.error(err);

                      memberFs.unlink(geoJsonPath);
                      deleteFolderRecursively(shapefileFolderPath);
                    });
                  });
                });
              } else if(request.query.format === 'csv') {
                var csvPath = memberPath.join(__dirname, '../tmp/BDQueimadas-CSV.' + request.query.dateTimeFrom.split(' ').join('_').split(':').join('-') + '.' + request.query.dateTimeTo.split(' ').join('_').split(':').join('-') + '.csv');
                var csvGenerationCommand = memberExportation.ogr2ogr() + " -F \"CSV\" " + csvPath + " " + geoJsonPath;

                memberExec(csvGenerationCommand, function(err, csvGenerationCommandResult, csvGenerationCommandError) {
                  if(err) return console.error(err);

                  response.download(csvPath, 'BDQueimadas-CSV.' + request.query.dateTimeFrom.split(' ').join('_').split(':').join('-') + '.' + request.query.dateTimeTo.split(' ').join('_').split(':').join('-') + '.csv', function(err) {
                    if(err) return console.error(err);

                    memberFs.unlink(geoJsonPath);
                    memberFs.unlink(csvPath);
                  });
                });
              } else if(request.query.format === 'kml') {
                var kmlPath = memberPath.join(__dirname, '../tmp/BDQueimadas-KML.' + request.query.dateTimeFrom.split(' ').join('_').split(':').join('-') + '.' + request.query.dateTimeTo.split(' ').join('_').split(':').join('-') + '.kml');
                var kmlGenerationCommand = memberExportation.ogr2ogr() + " -F \"KML\" " + kmlPath + " " + geoJsonPath;

                memberExec(kmlGenerationCommand, function(err, kmlGenerationCommandResult, kmlGenerationCommandError) {
                  if(err) return console.error(err);

                  response.download(kmlPath, 'BDQueimadas-KML.' + request.query.dateTimeFrom.split(' ').join('_').split(':').join('-') + '.' + request.query.dateTimeTo.split(' ').join('_').split(':').join('-') + '.kml', function(err) {
                    if(err) return console.error(err);

                    memberFs.unlink(geoJsonPath);
                    memberFs.unlink(kmlPath);
                  });
                });
              } else {
                response.download(geoJsonPath, 'BDQueimadas-GeoJSON.' + request.query.dateTimeFrom.split(' ').join('_').split(':').join('-') + '.' + request.query.dateTimeTo.split(' ').join('_').split(':').join('-') + '.json', function(err) {
                  if(err) return console.error(err);

                  memberFs.unlink(geoJsonPath);
                });
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
