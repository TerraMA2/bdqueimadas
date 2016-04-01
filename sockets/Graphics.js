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
    client.on('graphicsFiresCountBySatelliteRequest', function() {
      memberGraphics.getFiresCountBySatellite(function(err, firesCountBySatellite) {
        if(err) return console.error(err);

        client.emit('graphicsFiresCountBySatelliteResponse', { firesCountBySatellite: firesCountBySatellite });
      });
    });
  });
};

module.exports = Graphics;
