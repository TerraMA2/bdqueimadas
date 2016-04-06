"use strict";

/**
 * Controller of the system index.
 * @class IndexController
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberPath - 'path' module.
 * @property {object} memberFs - 'fs' module.
 * @property {object} memberFilter - Filter model.
 */
var IndexController = function(app) {

  // 'path' module
  var memberPath = require('path');
  // 'fs' module
  var memberFs = require('fs');
  // Filter model
  var memberFilter = new (require('../models/Filter.js'))();

  /**
   * Processes the request and returns a response.
   * @param {json} request - JSON containing the request data
   * @param {json} response - JSON containing the response data
   *
   * @function indexController
   * @memberof IndexController
   * @inner
   */
  var indexController = function(request, response) {

    // Load of the configuration files to be sent to the front end
    var filterConfig = JSON.parse(memberFs.readFileSync(memberPath.join(__dirname, '../configurations/Filter.json'), 'utf8')),
        attributesTableConfig = JSON.parse(memberFs.readFileSync(memberPath.join(__dirname, '../configurations/AttributesTable.json'), 'utf8')),
        componentsConfig = JSON.parse(memberFs.readFileSync(memberPath.join(__dirname, '../configurations/Components.json'), 'utf8')),
        mapConfig = JSON.parse(memberFs.readFileSync(memberPath.join(__dirname, '../configurations/Map.json'), 'utf8')),
        graphicsConfig = JSON.parse(memberFs.readFileSync(memberPath.join(__dirname, '../configurations/Graphics.json'), 'utf8'));

    memberFilter.getContinents(function(err, result) {
      if(err) return console.error(err);

      // Response parameters
      var params = {
        filterConfig: filterConfig,
        attributesTableConfig: attributesTableConfig,
        componentsConfig: componentsConfig,
        mapConfig: mapConfig,
        graphicsConfig: graphicsConfig,
        continents: result
      };

      // Response (page rendering)
      response.render('index', params);
    });
  };

  return indexController;
};

module.exports = IndexController;
