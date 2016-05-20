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
  var memberGraphics = new (require('../models/Graphics'))();

  // Socket connection event
  memberSockets.on('connection', function(client) {

    // Fires count graphics request event
    client.on('graphicsFiresCountRequest', function(json) {
      // Object responsible for keep several information to be used in the database query
      var options = {};

      // Verifications of the 'options' object items
      if(json.satellite !== '') options.satellite = json.satellite;
      if(json.extent !== '') options.extent = json.extent;
      if(json.country !== null && json.country !== '') options.country = json.country;
      if(json.state !== null && json.state !== '') options.state = json.state;

      memberGraphics.getFiresCount(json.dateFrom, json.dateTo, json.key, options, function(err, firesCount) {
        if(err) return console.error(err);

        client.emit('graphicsFiresCountResponse', { firesCount: firesCount, key: json.key, title: json.title });
      });
    });
  });
};

module.exports = Graphics;
