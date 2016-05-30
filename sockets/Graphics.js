"use strict";

/**
 * Socket responsible for processing graphics related requests.
 * @class Graphics
 * @variation 3
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberSockets - Sockets object.
 * @property {object} memberQueimadasApi - Queimadas Api module.
 * @property {json} memberApiConfigurations - Api configurations.
 */
var Graphics = function(io) {

  // Sockets object
  var memberSockets = io.sockets;
  // Queimadas Api module
  var memberQueimadasApi = new (require('../modules/QueimadasApi'))();
  // Api configurations
  var memberApiConfigurations = require('../configurations/Api');

  // Socket connection event
  memberSockets.on('connection', function(client) {

    // Fires count graphics request event
    client.on('graphicsFiresCountRequest', function(json) {
      var parameters = [
        {
          "Key": memberApiConfigurations.RequestsFields.GetFiresCount.DateFrom,
          "Value": json.dateFrom
        },
        {
          "Key": memberApiConfigurations.RequestsFields.GetFiresCount.DateTo,
          "Value": json.dateTo
        },
        {
          "Key": memberApiConfigurations.RequestsFields.GetFiresCount.Aggregate,
          "Value": json.key
        }
      ];

      // Verifications of the parameters
      if(json.satellite !== '') {
        parameters.push({
          "Key": memberApiConfigurations.RequestsFields.GetFiresCount.Satellite,
          "Value": json.satellite
        });
      }

      if(json.extent !== '') {
        parameters.push({
          "Key": memberApiConfigurations.RequestsFields.GetFiresCount.Extent,
          "Value": json.extent
        });
      }

      if(json.country !== null && json.country !== '') {
        parameters.push({
          "Key": memberApiConfigurations.RequestsFields.GetFiresCount.Country,
          "Value": json.country
        });
      }

      if(json.state !== null && json.state !== '') {
        parameters.push({
          "Key": memberApiConfigurations.RequestsFields.GetFiresCount.State,
          "Value": json.state
        });
      }

      memberQueimadasApi.getData("GetFiresCount", parameters, [], function(err, firesCount) {
        if(err) return console.error(err);

        client.emit('graphicsFiresCountResponse', { firesCount: firesCount, key: json.key, title: json.title });
      });
    });
  });
};

module.exports = Graphics;
