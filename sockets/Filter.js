"use strict";

/**
 * Socket responsible for processing filter related requests.
 * @class Filter
 * @variation 3
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberSockets - Sockets object.
 * @property {object} memberFilter - Filter model.
 */
var Filter = function(io) {

  // Sockets object
  var memberSockets = io.sockets;
  // Filter model
  var memberFilter = new (require('../models/Filter.js'))();

  // Socket connection event
  memberSockets.on('connection', function(client) {

    // Fires count request event
    client.on('checkFiresCountRequest', function(json) {
      // Object responsible for keep several information to be used in the database query
      var options = {};

      // Verifications of the 'options' object items
      if(json.satellites !== '') options.satellites = json.satellites;
      if(json.biomes !== '') options.biomes = json.biomes;
      if(json.extent !== '') options.extent = json.extent;
      if(json.continent !== undefined && json.continent !== null && json.continent !== '') options.continent = json.continent;
      if(json.countries !== null && json.countries !== '') options.countries = json.countries;
      if(json.states !== null && json.states !== '') options.states = json.states;

      memberFilter.getFiresCount(client.pgPool, json.dateTimeFrom, json.dateTimeTo, options, function(err, firesCount) {
        if(err) return console.error(err);

        client.emit('checkFiresCountResponse', { firesCount: firesCount });
      });
    });

    // Spatial filter request event
    client.on('spatialFilterRequest', function(json) {
      if(json.key === 'States' && json.specialRegions.length > 0 && json.ids.length > 0) {
        memberFilter.getStatesAndSpecialRegionsExtent(client.pgPool, json.ids, json.specialRegions, function(err, extent) {
          if(err) return console.error(err);

          client.emit('spatialFilterResponse', { key: json.key, ids: json.ids, specialRegions: json.specialRegions, extent: extent });
        });
      } else if(json.key === 'States' && json.specialRegions.length > 0 && json.ids.length === 0) {
        memberFilter.getSpecialRegionsExtent(client.pgPool, json.specialRegions, function(err, extent) {
          if(err) return console.error(err);

          client.emit('spatialFilterResponse', { key: json.key, ids: json.ids, specialRegions: json.specialRegions, extent: extent });
        });
      } else if(json.key === 'ProtectedArea') {
        memberFilter.getProtectedAreaExtent(client.pgPool, json.id, json.type, function(err, extent) {
          if(err) return console.error(err);

          client.emit('spatialFilterResponse', { key: json.key, id: json.id, type: json.type, extent: extent });
        });
      } else if(json.key === 'City') {
        memberFilter.getCityExtent(client.pgPool, json.id, function(err, extent) {
          if(err) return console.error(err);

          client.emit('spatialFilterResponse', { key: json.key, id: json.id, extent: extent });
        });
      } else {
        var functionName = "get" + json.key + "Extent";
        memberFilter[functionName](client.pgPool, json.ids, function(err, extent) {
          if(err) return console.error(err);

          client.emit('spatialFilterResponse', { key: json.key, ids: json.ids, specialRegions: [], extent: extent });
        });
      }
    });

    // Data by intersection request event
    client.on('dataByIntersectionRequest', function(json) {
      memberFilter.getDataByIntersection(client.pgPool, json.longitude, json.latitude, json.resolution, function(err, data) {
        if(err) return console.error(err);

        client.emit('dataByIntersectionResponse', { data: data });
      });
    });

    // Continent by country request event
    client.on('continentByCountryRequest', function(json) {
      memberFilter.getContinentByCountry(client.pgPool, json.country, function(err, continent) {
        if(err) return console.error(err);

        client.emit('continentByCountryResponse', { continent: continent });
      });
    });

    // Continent by state request event
    client.on('continentByStateRequest', function(json) {
      memberFilter.getContinentByState(client.pgPool, json.state, function(err, continent) {
        if(err) return console.error(err);

        client.emit('continentByStateResponse', { continent: continent });
      });
    });

    // Country by state request event
    client.on('countriesByStatesRequest', function(json) {
      memberFilter.getCountriesByStates(client.pgPool, json.states, function(err, countriesByStates) {
        if(err) return console.error(err);

        memberFilter.getCountriesByContinent(client.pgPool, countriesByStates.rows[0].continent, function(err, countries) {
          if(err) return console.error(err);

          client.emit('countriesByStatesResponse', { countriesByStates: countriesByStates, countries: countries });
        });
      });
    });

    // Countries by continent request event
    client.on('countriesByContinentRequest', function(json) {
      memberFilter.getCountriesByContinent(client.pgPool, json.continent, function(err, countries) {
        if(err) return console.error(err);

        client.emit('countriesByContinentResponse', { countries: countries, filter: json.filter });
      });
    });

    // States by country request event
    client.on('statesByCountryRequest', function(json) {
      memberFilter.getStatesByCountry(client.pgPool, json.country, function(err, states) {
        if(err) return console.error(err);

        memberFilter.getSpecialRegions(client.pgPool, [json.country], function(err, specialRegions) {
          if(err) return console.error(err);

          client.emit('statesByCountryResponse', { states: states, specialRegions: specialRegions, filter: json.filter });
        });
      });
    });

    // States by countries request event
    client.on('statesByCountriesRequest', function(json) {
      memberFilter.getStatesByCountries(client.pgPool, json.countries, function(err, states) {
        if(err) return console.error(err);

        memberFilter.getSpecialRegions(client.pgPool, json.countries, function(err, specialRegions) {
          if(err) return console.error(err);

          client.emit('statesByCountriesResponse', { states: states, specialRegions: specialRegions, filter: json.filter });
        });
      });
    });

    // Get satellites request event
    client.on('getSatellitesRequest', function(json) {
      // Object responsible for keep several information to be used in the database query
      var options = {};

      // Verifications of the 'options' object items
      if(json.satellites !== '') options.satellites = json.satellites;
      if(json.biomes !== '') options.biomes = json.biomes;
      if(json.extent !== '') options.extent = json.extent;
      if(json.continent !== undefined && json.continent !== null && json.continent !== '') options.continent = json.continent;
      if(json.countries !== null && json.countries !== '') options.countries = json.countries;
      if(json.states !== null && json.states !== '') options.states = json.states;

      memberFilter.getSatellites(client.pgPool, json.dateTimeFrom, json.dateTimeTo, options, function(err, satellitesList) {
        if(err) return console.error(err);

        client.emit('getSatellitesResponse', { satellitesList: satellitesList });
      });
    });
  });
};

module.exports = Filter;
