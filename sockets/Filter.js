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
 * @property {object} memberQueimadasApi - Queimadas Api module.
 * @property {json} memberApiConfigurations - Api configurations.
 * @property {json} memberFilterConfig - Filter configuration.
 */
var Filter = function(io) {

  // Sockets object
  var memberSockets = io.sockets;
  // 'path' module
  var memberPath = require('path');
  // Queimadas Api module
  var memberQueimadasApi = new (require(memberPath.join(__dirname, '../modules/QueimadasApi')))();
  // Api configurations
  var memberApiConfigurations = require(memberPath.join(__dirname, '../configurations/Api'));
  // Filter configuration
  var memberFilterConfig = require(memberPath.join(__dirname, '../configurations/Filter'));

  // Socket connection event
  memberSockets.on('connection', function(client) {

    // Spatial filter request event
    client.on('spatialFilterRequest', function(json) {
      var functionName = "Get" + json.key + "Extent";

      memberQueimadasApi.getData(functionName, [], [json.id], function(err, extent) {
        if(err) return console.error(err);

        client.emit('spatialFilterResponse', {
          key: json.key,
          id: json.id,
          text: extent[0][memberApiConfigurations.RequestsFields[functionName].Name],
          extent: extent[0][memberApiConfigurations.RequestsFields[functionName].Extent]
        });
      });
    });

    // Data by intersection request event
    client.on('dataByIntersectionRequest', function(json) {
      var key = "State";

      if(json.resolution >= memberFilterConfig.SpatialFilter.Continents.MinResolution)
        key = "Continent";
      else if(json.resolution >= memberFilterConfig.SpatialFilter.Countries.MinResolution && json.resolution < memberFilterConfig.SpatialFilter.Countries.MaxResolution)
        key = "Country";

      memberQueimadasApi.getData(
        "DataByIntersection",
        [
          {
            "Key": "tipo",
            "Value": memberApiConfigurations.RequestsFields["DataByIntersection"].Types[key]
          },
          {
            "Key": "latlng",
            "Value": json.longitude + " " + json.latitude
          },
        ],
        [],
        function(err, data) {
          if(err) return console.error(err);

          client.emit('dataByIntersectionResponse', { data: data, key: key });
        }
      );
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
        [],
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
        [],
        function(err, states) {
          if(err) return console.error(err);

          client.emit('statesByCountryResponse', { states: states });
        }
      );
    });
  });
};

module.exports = Filter;
