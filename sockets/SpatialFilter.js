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

      filter.getCountriesByContinent(json.continent, function(err, countries) {
        if(err) return console.error(err);

        filter.getContinentExtent(json.continent, function(err, continentExtent) {
          if(err) return console.error(err);

          client.emit('continentFilterResponse', { countries: countries, continentExtent: continentExtent });
        });
      });
    });

    // Country filter request event
    client.on('countryFilterRequest', function(json) {

      filter.getStatesByCountry(json.country, function(err, states) {
        if(err) return console.error(err);

        filter.getCountryExtent(json.country, function(err, countryExtent) {
          if(err) return console.error(err);

          client.emit('countryFilterResponse', { states: states, countryExtent: countryExtent });
        });
      });
    });

    // State filter request event
    client.on('stateFilterRequest', function(json) {
      filter.getStateExtent(json.state, function(err, stateExtent) {
        if(err) return console.error(err);

        client.emit('stateFilterResponse', { stateExtent: stateExtent });
      });
    });
  });
};

module.exports = SpatialFilter;
