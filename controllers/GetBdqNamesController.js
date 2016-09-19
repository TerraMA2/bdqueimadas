"use strict";

/**
 * Controller responsible for returning the BDQ names of countries and states.
 * @class GetBdqNamesController
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberFilter - 'Filter' model.
 */
var GetBdqNamesController = function(app) {

  // 'Filter' model
  var memberFilter = new (require('../models/Filter.js'))();

  /**
   * Processes the request and returns a response.
   * @param {json} request - JSON containing the request data
   * @param {json} response - JSON containing the response data
   *
   * @function getBdqNamesController
   * @memberof GetBdqNamesController
   * @inner
   */
  var getBdqNamesController = function(request, response) {
    if(request.query.key == "Countries") {
      var countriesIds = request.query.ids !== "" ? request.query.ids.split(',') : [];

      memberFilter.getCountriesBdqNames(request.pgPool, countriesIds, function(err, countriesNames) {
        if(err) return console.error(err);

        // JSON response
        response.json({
          names: countriesNames
        });
      });
    } else if(request.query.key == "States") {
      var statesIds = request.query.ids !== "" ? request.query.ids.split(',') : [];

      memberFilter.getStatesBdqNames(request.pgPool, statesIds, function(err, statesNames) {
        if(err) return console.error(err);

        // JSON response
        response.json({
          names: statesNames
        });
      });
    } else {
      var countriesIds = request.query.countriesIds !== "" ? request.query.countriesIds.split(',') : [];
      var statesIds = request.query.statesIds !== "" ? request.query.statesIds.split(',') : [];

      memberFilter.getCountriesBdqNames(request.pgPool, countriesIds, function(err, countriesNames) {
        if(err) return console.error(err);

        memberFilter.getStatesBdqNames(request.pgPool, statesIds, function(err, statesNames) {
          if(err) return console.error(err);

          // JSON response
          response.json({
            countriesNames: countriesNames,
            statesNames: statesNames
          });
        });
      });
    }
  };

  return getBdqNamesController;
};

module.exports = GetBdqNamesController;
