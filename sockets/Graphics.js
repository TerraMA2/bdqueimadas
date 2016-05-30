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
 */
var Graphics = function(io) {

  // Sockets object
  var memberSockets = io.sockets;
  // Queimadas Api module
  var memberQueimadasApi = new (require('../modules/QueimadasApi'))();

  // Socket connection event
  memberSockets.on('connection', function(client) {

    // Fires count graphics request event
    client.on('graphicsFiresCountRequest', function(json) {
      var parameters = [
        {
          "Key": "inicio",
          "Value": json.dateFrom
        },
        {
          "Key": "fim",
          "Value": json.dateTo
        },
        {
          "Key": "agregar",
          "Value": json.key
        }
      ];

      // Verifications of the parameters
      if(json.satellite !== '') {
        parameters.push({
          "Key": "satelite",
          "Value": json.satellite
        });
      }

      if(json.extent !== '') {
        parameters.push({
          "Key": "extent",
          "Value": json.extent
        });
      }

      if(json.country !== null && json.country !== '') {
        parameters.push({
          "Key": "pais",
          "Value": json.country
        });
      }

      if(json.state !== null && json.state !== '') {
        parameters.push({
          "Key": "estado",
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
