"use strict";

/**
 * Socket responsible for processing filter related requests.
 * @class Filter
 * @variation 3
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberSockets - Sockets object.
 * @property {object} memberQueimadasApi - Queimadas Api module.
 * @property {json} memberApiConfigurations - Api configurations.
 * @property {json} memberFilterConfig - Filter configuration.
 */
var Filter = function(io) {

  // Sockets object
  var memberSockets = io.sockets;
  // Queimadas Api module
  var memberQueimadasApi = new (require('../modules/QueimadasApi'))();
  // Api configurations
  var memberApiConfigurations = require('../configurations/Api');
  // Filter configuration
  var memberFilterConfig = require('../configurations/Filter');

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
      var key = "States";

      if(json.resolution >= memberFilterConfig.SpatialFilter.Continents.MinResolution)
        key = "Continents";
      else if(json.resolution >= memberFilterConfig.SpatialFilter.Countries.MinResolution && json.resolution < memberFilterConfig.SpatialFilter.Countries.MaxResolution)
        key = "Countries";

      memberQueimadasApi.getData(
        "DataByIntersection",
        [
          {
            "Key": memberApiConfigurations.RequestsFields.DataByIntersection.Type,
            "Value": memberApiConfigurations.RequestsFields["DataByIntersection"].Types[key]
          },
          {
            "Key": memberApiConfigurations.RequestsFields.DataByIntersection.Coordinates,
            "Value": json.longitude + "%20" + json.latitude
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
            "Key": memberApiConfigurations.RequestsFields.GetCountries.Continent,
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
            "Key": memberApiConfigurations.RequestsFields.GetStates.Country,
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
