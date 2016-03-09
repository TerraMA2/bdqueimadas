"use strict";

/**
 * Controller of the system index.
 * @class IndexController
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
   * @returns {function} indexController - The controller function
   *
   * @function indexController
   * @memberof IndexController
   * @inner
   */
  var indexController = function(request, response) {

    // Load of the configuration files to be sent to the front end
    var filterConfig = JSON.parse(memberFs.readFileSync(memberPath.join(__dirname, '../configurations/Filter.json'), 'utf8')),
        serverConfig = JSON.parse(memberFs.readFileSync(memberPath.join(__dirname, '../configurations/Server.json'), 'utf8')),
        attributesTableConfig = JSON.parse(memberFs.readFileSync(memberPath.join(__dirname, '../configurations/AttributesTable.json'), 'utf8')),
        componentsConfig = JSON.parse(memberFs.readFileSync(memberPath.join(__dirname, '../configurations/Components.json'), 'utf8'));

    memberFilter.getContinents(function(err, result) {
      if(err) return console.error(err);

      // Response parameters
      var params = {
        filterConfig: filterConfig,
        serverConfig: serverConfig,
        attributesTableConfig: attributesTableConfig,
        componentsConfig: componentsConfig,
        continents: result
      };

      // Response (page rendering)
      response.render('index', params);
    });
  };

  return indexController;
};

module.exports = IndexController;
