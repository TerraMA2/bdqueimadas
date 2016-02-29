"use strict";

/**
 * Controller of the system index.
 * @class IndexController
 *
 * @property {object} path - 'path' module.
 * @property {object} fs - 'fs' module.
 * @property {object} filter - Filter model.
 */
var IndexController = function(app) {

  // 'path' module
  var path = require('path');
  // 'fs' module
  var fs = require('fs');
  // Filter model
  var filter = new (require(path.join(__dirname, '../models/Filter.js')))();

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
    var filterConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../configurations/Filter.json'), 'utf8')),
        serverConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../configurations/Server.json'), 'utf8')),
        attributesTableConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../configurations/AttributesTable.json'), 'utf8'));

    filter.getContinents(function(err, result) {
      if(err) return console.error(err);

      // Response parameters
      var params = {
        filterConfig: filterConfig,
        serverConfig: serverConfig,
        attributesTableConfig: attributesTableConfig,
        continents: result
      };

      // Response (page rendering)
      response.render('index', params);
    });
  };

  return indexController;
};

module.exports = IndexController;
