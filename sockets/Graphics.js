"use strict";

/**
 * Socket responsible for processing graphics related requests.
 * @class Graphics
 * @variation 3
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberSockets - Sockets object.
 * @property {object} memberGraphics - Graphics model.
 */
var Graphics = function(io) {

  // Sockets object
  var memberSockets = io.sockets;
  // Graphics model
  var memberGraphics = new (require('../models/Graphics.js'))();

  // Socket connection event
  memberSockets.on('connection', function(client) {

    // Graphics request event
    client.on('graphicsFiresCountBySatelliteRequest', function(json) {
      // Object responsible for keep several information to be used in the database query
      var options = {};

      // Verifications of the 'options' object items
      if(json.satellite !== '') options.satellite = json.satellite;
      if(json.extent !== '') options.extent = json.extent;

      memberGraphics.getFiresCountBySatellite(json.dateFrom, json.dateTo, options, function(err, firesCountBySatellite) {
        if(err) return console.error(err);

        client.emit('graphicsFiresCountBySatelliteResponse', { firesCountBySatellite: firesCountBySatellite });
      });
    });
  });
};

module.exports = Graphics;
