"use strict";

/**
 * Socket responsible for processing filter related requests.
 * @class Filter
 * @variation 3
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberSockets - Sockets object.
 * @property {object} memberPath - 'path' module.
 * @property {object} memberFilter - Filter model.
 * @property {object} memberQueimadasApi - Queimadas Api module.
 */
var Filter = function(io) {

  // Sockets object
  var memberSockets = io.sockets;
  // 'path' module
  var memberPath = require('path');
  // Filter model
  var memberFilter = new (require(memberPath.join(__dirname, '../models/Filter.js')))();
  // Queimadas Api module
  var memberQueimadasApi = new (require(memberPath.join(__dirname, '../modules/QueimadasApi.js')))();

  // Socket connection event
  memberSockets.on('connection', function(client) {

    // Spatial filter request event
    client.on('spatialFilterRequest', function(json) {
      var functionName = "get" + json.key + "Extent";
      memberFilter[functionName](json.id, function(err, extent) {
        if(err) return console.error(err);

        client.emit('spatialFilterResponse', { key: json.key, id: json.id, text: json.text, extent: extent });
      });
    });

    // Data by intersection request event
    client.on('dataByIntersectionRequest', function(json) {
      memberFilter.getDataByIntersection(json.longitude, json.latitude, json.resolution, function(err, data) {
        if(err) return console.error(err);

        client.emit('dataByIntersectionResponse', { data: data });
      });
    });

    // Continent by country request event
    client.on('continentByCountryRequest', function(json) {
      memberFilter.getContinentByCountry(json.country, function(err, continent) {
        if(err) return console.error(err);

        client.emit('continentByCountryResponse', { continent: continent });
      });
    });

    // Continent by state request event
    client.on('continentByStateRequest', function(json) {
      memberFilter.getContinentByState(json.state, function(err, continent) {
        if(err) return console.error(err);

        client.emit('continentByStateResponse', { continent: continent });
      });
    });

    // Country by state request event
    client.on('countryByStateRequest', function(json) {
      memberFilter.getCountryByState(json.state, function(err, country) {
        if(err) return console.error(err);

        memberFilter.getCountriesByContinent(country.rows[0].continent, function(err, countries) {
          if(err) return console.error(err);

          client.emit('countryByStateResponse', { country: country, countries: countries });
        });
      });
    });

    // Countries by continent request event
    client.on('countriesByContinentRequest', function(json) {

      memberQueimadasApi.getData(
        "GetCountries",
        [
          {
            "Key": "continente",
            "Value": json.continent
          }
        ],
        function(err, countries) {
          if(err) return console.error(err);

          client.emit('countriesByContinentResponse', { countries: countries });
        }
      );
    });

    // States by country request event
    client.on('statesByCountryRequest', function(json) {

      memberQueimadasApi.getData(
        "GetStates",
        [
          {
            "Key": "pais",
            "Value": json.country
          }
        ],
        function(err, states) {
          if(err) return console.error(err);

          client.emit('statesByCountryResponse', { states: states });
        }
      );
    });
  });
};

module.exports = Filter;
