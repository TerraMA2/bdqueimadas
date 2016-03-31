"use strict";

/**
 * Socket responsible for processing graphics related requests.
 * @class Graphics
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
    client.on('graphicsRequest', function(json) {
      memberGraphics.method(json.id, function(err, extent) {
        if(err) return console.error(err);

        client.emit('graphicsResponse', { key: json.key, id: json.id, text: json.text, extent: extent });
      });
    });
  });
};

module.exports = Graphics;
