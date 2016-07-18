"use strict";

/**
 * Controller responsible for export the Graphics data.
 * @class ExportGraphicDataController
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberGraphics - 'Graphics' model.
 * @property {object} memberFs - 'fs' module.
 */
var ExportGraphicDataController = function(app) {

  // 'Graphics' model
  var memberGraphics = new (require('../models/Graphics.js'))();
  // 'fs' module
  var memberFs = require('fs');

  /**
   * Processes the request and returns a response.
   * @param {json} request - JSON containing the request data
   * @param {json} response - JSON containing the response data
   *
   * @function exportGraphicDataController
   * @memberof ExportGraphicDataController
   * @inner
   */
  var exportGraphicDataController = function(request, response) {

    // Object responsible for keeping several information to be used in the database query
    var options = {};

    // Verifications of the 'options' object items
    if(request.query.satellites !== '') options.satellites = request.query.satellites;
    if(request.query.biomes !== '') options.biomes = request.query.biomes;
    if(request.query.extent !== '') options.extent = request.query.extent.split(',');
    if(request.query.countries !== '') options.countries = request.query.countries;
    if(request.query.states !== '') options.states = request.query.states;
    if(request.query.limit !== '' && request.query.limit !== null && request.query.limit !== 'null') options.limit = request.query.limit;

    memberGraphics.getFiresTotalCount(request.query.dateFrom, request.query.dateTo, options, function(err, firesTotalCount) {
      if(err) return console.error(err);

      memberGraphics.getFiresCount(request.query.dateFrom, request.query.dateTo, request.query.key, options, function(err, firesCount) {
        if(err) return console.error(err);

        var csv = createCsvFiresCount(firesTotalCount, firesCount);
        var path = require('path');

        require('crypto').randomBytes(24, function(err, buffer) {
          var csvPath = path.join(__dirname, '../tmp/graphic-csv-' + buffer.toString('hex') + '.csv');

          memberFs.writeFile(csvPath, csv, 'ascii', function(err) {
            if(err) return console.error(err);

            response.download(csvPath, 'Focos por ' + request.query.key + ' - de ' + request.query.dateFrom + ' a ' + request.query.dateTo + '.csv', function(err) {
              if(err) return console.error(err);

              memberFs.unlink(csvPath);
            });
          });
        });
      });
    });
  };

  /**
   * Creates the csv file content for the fires count graphic exportation.
   * @param {json} firesTotalCount - Total fires count for the given filters
   * @param {json} firesCount - Fires count for the given filters grouped by the given key
   *
   * @private
   * @function createCsvFiresCount
   * @memberof ExportGraphicDataController
   * @inner
   */
  var createCsvFiresCount = function(firesTotalCount, firesCount) {
    var csv = "Campo,Valor,Percentagem do Total de Focos\n";

    firesCount.rows.forEach(function(item) {
      csv += ((item.key !== null && item.key !== "") ? item.key : "Não Identificado") + ',' + item.count + ',' + ((parseFloat(item.count) / parseFloat(firesTotalCount.rows[0].count)) * 100).toFixed(2) + '%\n';
    });

    return csv;
  };

  return exportGraphicDataController;
};

module.exports = ExportGraphicDataController;
