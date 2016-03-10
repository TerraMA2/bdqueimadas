"use strict";

/**
 * Socket responsible for processing spatial filter related requests.
 * @class SpatialFilter
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberSockets - Sockets object.
 * @property {object} memberFilter - Filter model.
 */
var SpatialFilter = function(io) {

  // Sockets object
  var memberSockets = io.sockets;
  // Filter model
  var memberFilter = new (require('../models/Filter.js'))();

  // Socket connection event
  memberSockets.on('connection', function(client) {

    // Continent filter request event
    client.on('continentFilterRequest', function(json) {

      memberFilter.getCountriesByContinent(json.continent, function(err, countries) {
        if(err) return console.error(err);

        memberFilter.getContinentExtent(json.continent, function(err, continentExtent) {
          if(err) return console.error(err);

          client.emit('continentFilterResponse', { countries: countries, continentExtent: continentExtent });
        });
      });
    });

    // Country filter request event
    client.on('countryFilterRequest', function(json) {

      memberFilter.getStatesByCountry(json.country, function(err, states) {
        if(err) return console.error(err);

        memberFilter.getCountryExtent(json.country, function(err, countryExtent) {
          if(err) return console.error(err);

          client.emit('countryFilterResponse', { states: states, countryExtent: countryExtent });
        });
      });
    });

    // State filter request event
    client.on('stateFilterRequest', function(json) {
      memberFilter.getStateExtent(json.state, function(err, stateExtent) {
        if(err) return console.error(err);

        client.emit('stateFilterResponse', { stateExtent: stateExtent });
      });
    });

    // Extent by intersection event
    client.on('extentByIntersectionRequest', function(json) {
      memberFilter.getExtentByIntersection(json.longitude, json.latitude, json.resolution, function(err, extent) {
        if(err) return console.error(err);

        client.emit('extentByIntersectionResponse', { extent: extent });
      });
    });
  });
};

module.exports = SpatialFilter;
