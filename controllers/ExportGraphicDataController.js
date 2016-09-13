"use strict";

/**
 * Controller responsible for export the Graphics data.
 * @class ExportGraphicDataController
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberGraphics - 'Graphics' model.
 * @property {object} memberFs - 'fs' module.
 * @property {object} memberPath - 'path' module.
 * @property {object} memberGraphicsConfigurations - Graphics configuration.
 */
var ExportGraphicDataController = function(app) {

  // 'Graphics' model
  var memberGraphics = new (require('../models/Graphics.js'))();
  // 'fs' module
  var memberFs = require('fs');
  // 'path' module
  var memberPath = require('path');
  // Graphics configuration
  var memberGraphicsConfigurations = require(memberPath.join(__dirname, '../configurations/Graphics.json'));

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
    if(request.query.countries !== '') options.countries = request.query.countries;
    if(request.query.states !== '') options.states = request.query.states;
    if(request.query.cities !== '') options.cities = request.query.cities;
    if(request.query.protectedArea !== null && request.query.protectedArea !== '') options.protectedArea = JSON.parse(request.query.protectedArea);

    var graphicConfigurations = getGraphicConfigurations(request.query.id);

    if(graphicConfigurations.Limit !== null) options.limit = graphicConfigurations.Limit;
    options.y = graphicConfigurations.Y;

    var filterRules = {
      ignoreCountryFilter: graphicConfigurations.IgnoreCountryFilter,
      ignoreStateFilter: graphicConfigurations.IgnoreStateFilter,
      ignoreCityFilter: graphicConfigurations.IgnoreCityFilter,
      showOnlyIfThereIsACountryFiltered: graphicConfigurations.ShowOnlyIfThereIsACountryFiltered,
      showOnlyIfThereIsNoCountryFiltered: graphicConfigurations.ShowOnlyIfThereIsNoCountryFiltered,
      showOnlyIfThereIsAStateFiltered: graphicConfigurations.ShowOnlyIfThereIsAStateFiltered,
      showOnlyIfThereIsNoStateFiltered: graphicConfigurations.ShowOnlyIfThereIsNoStateFiltered
    };

    memberGraphics.getFiresTotalCount(request.query.dateFrom, request.query.dateTo, filterRules, options, function(err, firesTotalCount) {
      if(err) return console.error(err);

      if(graphicConfigurations.Key === "week") {
        memberGraphics.getFiresCountByWeek(request.query.dateFrom, request.query.dateTo, filterRules, options, function(err, firesCount) {
          if(err) return console.error(err);

          downloadCsvFiresCount(firesTotalCount, firesCount, graphicConfigurations.Y, graphicConfigurations.Key, request.query.dateFrom, request.query.dateTo, response);
        });
      } else if(graphicConfigurations.Key === "UCE" || graphicConfigurations.Key === "UCF" || graphicConfigurations.Key === "TI" || graphicConfigurations.Key === "UCE_5KM" || graphicConfigurations.Key === "UCF_5KM" || graphicConfigurations.Key === "TI_5KM" || graphicConfigurations.Key === "UCE_10KM" || graphicConfigurations.Key === "UCF_10KM" || graphicConfigurations.Key === "TI_10KM") {
        memberGraphics.getFiresCountByPA(request.query.dateFrom, request.query.dateTo, graphicConfigurations.Key, filterRules, options, function(err, firesCount) {
          if(err) return console.error(err);

          downloadCsvFiresCount(firesTotalCount, firesCount, graphicConfigurations.Y, graphicConfigurations.Key, request.query.dateFrom, request.query.dateTo, response);
        });
      } else {
        memberGraphics.getFiresCount(request.query.dateFrom, request.query.dateTo, graphicConfigurations.Key, filterRules, options, function(err, firesCount) {
          if(err) return console.error(err);

          downloadCsvFiresCount(firesTotalCount, firesCount, graphicConfigurations.Y, graphicConfigurations.Key, request.query.dateFrom, request.query.dateTo, response);
        });
      }
    });
  };

  /**
   * Downloads the csv file.
   * @param {json} firesTotalCount - Total fires count for the given filters
   * @param {json} firesCount - Fires count for the given filters grouped by the given key
   * @param {string} y - Y label of the graphic
   * @param {string} key - Graphic key
   * @param {string} dateFrom - Initial date
   * @param {string} dateTo - Final date
   * @param {object} response - Response object
   *
   * @private
   * @function downloadCsvFiresCount
   * @memberof ExportGraphicDataController
   * @inner
   */
  var downloadCsvFiresCount = function(firesTotalCount, firesCount, y, key, dateFrom, dateTo, response) {
    var csv = createCsvFiresCount(firesTotalCount, firesCount, y);
    var path = require('path');

    require('crypto').randomBytes(24, function(err, buffer) {
      var csvPath = path.join(__dirname, '../tmp/graphic-csv-' + buffer.toString('hex') + '.csv');

      memberFs.writeFile(csvPath, csv, 'ascii', function(err) {
        if(err) return console.error(err);

        response.download(csvPath, 'Focos por ' + key + ' - de ' + dateFrom + ' a ' + dateTo + '.csv', function(err) {
          if(err) return console.error(err);

          memberFs.unlink(csvPath);
        });
      });
    });
  };

  /**
   * Creates the csv file content for the fires count graphic exportation.
   * @param {json} firesTotalCount - Total fires count for the given filters
   * @param {json} firesCount - Fires count for the given filters grouped by the given key
   * @param {string} y - Y label of the graphic
   *
   * @private
   * @function createCsvFiresCount
   * @memberof ExportGraphicDataController
   * @inner
   */
  var createCsvFiresCount = function(firesTotalCount, firesCount, y) {
    var csv = "Campo,Valor,Percentagem do Total de Focos\n";
    var yFields = y.match(/[^{\}]+(?=})/g);

    firesCount.rows.forEach(function(item) {
      var label = y;

      for(var i = 0, count = yFields.length; i < count; i++) {
        var field = (item[yFields[i]] !== null && item[yFields[i]] !== undefined && item[yFields[i]] !== "" ? item[yFields[i]]: "Não Identificado");

        label = label.replace("{" + yFields[i] + "}", field);
      }

      csv += label + ',' + item.count + ',' + ((parseFloat(item.count) / parseFloat(firesTotalCount.rows[0].count)) * 100).toFixed(2) + '%\n';
    });

    return csv;
  };

  /**
   * Returns the graphic configurations accordingly with given id.
   * @param {string} id - Graphic id
   * @returns {json} configurations - Graphic configurations
   *
   * @private
   * @function getGraphicConfigurations
   * @memberof ExportGraphicDataController
   * @inner
   */
  var getGraphicConfigurations = function(id) {
    for(var i = 0, count = memberGraphicsConfigurations.FiresCount.length; i < count; i++) {
      if(id === memberGraphicsConfigurations.FiresCount[i].Id) {
        return memberGraphicsConfigurations.FiresCount[i];
      }
    }
  };

  return exportGraphicDataController;
};

module.exports = ExportGraphicDataController;
