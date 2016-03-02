"use strict";

/**
 * Controller responsible for returning the countries layer features.
 * @class GetCountriesLayerFeaturesController
 *
 * @property {object} fs - 'fs' module.
 * @property {object} filter - Filter model.
 */
var GetCountriesLayerFeaturesController = function(app) {

  // 'fs' module
  var fs = require('fs');
  // Filter model
  var filter = new (require('../models/Filter.js'))();

  /**
   * Processes the request and returns a response.
   * @param {json} request - JSON containing the request data
   * @param {json} response - JSON containing the response data
   * @returns {function} getCountriesLayerFeaturesController - The controller function
   *
   * @function getCountriesLayerFeaturesController
   * @memberof GetCountriesLayerFeaturesController
   * @inner
   */
  var getCountriesLayerFeaturesController = function(request, response) {
    var request = require("request");
    var url = 'http://localhost:9095/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&outputFormat=application/json&typeName=sde:countries';

    request({
      url: url,
      json: true
    }, function(err, jsonResponse, body) {
      if(err) return callback(err);
      if(jsonResponse.statusCode !== 200) return callback({"Url": url, "Response": jsonResponse.statusCode});

      var count = 0;
      body.features.forEach(function(feature) {
        filter.getFiresCountByCountry(feature.properties.name, function(err, firesCount) {
          if(err) return callback(err);
          count++;

          feature.properties.fires_count = firesCount.rows[0].firescount;

          if(count === parseInt(body.totalFeatures)) {
            response.json(body);
          }
        });
      });
    });
  };

  return getCountriesLayerFeaturesController;
};

module.exports = GetCountriesLayerFeaturesController;
