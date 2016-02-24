"use strict";

/** @class IndexController - Controller of the system index. */
var IndexController = function(app) {
  var path = require('path'),
      fs = require('fs');

  /**
   * Processes the request and returns a response
   * @param {json} request - JSON containing the request data
   * @param {json} response - JSON containing the response data
   * @returns {function} indexController - the controller function
   */
  var indexController = function(request, response) {

    // Load of the configuration files to be sent to the front end
    var filterConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../configurations/Filter.json'), 'utf8')),
        serverConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../configurations/Server.json'), 'utf8')),
        attributesTableConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../configurations/AttributesTable.json'), 'utf8'));

    // Response parameters
    var params = {
      filterConfig: filterConfig,
      serverConfig: serverConfig,
      attributesTableConfig: attributesTableConfig
    };

    // Response (page rendering)
    response.render('index', params);
  };

  return indexController;
};

module.exports = IndexController;
