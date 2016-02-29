"use strict";

/**
 * Socket responsible for doing cross-domain requests.
 * @class Proxy
 */
var SpatialFilter = function(io) {

  var sockets = io.sockets;
  // Filter model
  var filter = new (require('../models/Filter.js'))();

  // Socket connection event
  sockets.on('connection', function(client) {

    // Continent filter request event
    client.on('continentFilterRequest', function(json) {

      filter.getCountriesByContinent(json.continent, function(err, result) {
        if(err) return console.error(err);

        client.emit('continentFilterResponse', { msg: result });
      });
    });

    // Country filter request event
    client.on('countryFilterRequest', function(json) {

      filter.getStatesByCountry(json.country, function(err, result) {
        if(err) return console.error(err);

        client.emit('countryFilterResponse', { msg: result });
      });
    });

    // State filter request event
    client.on('stateFilterRequest', function(json) {

    });
  });
};

module.exports = SpatialFilter;
