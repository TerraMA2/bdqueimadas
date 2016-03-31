"use strict";

/**
 * Socket responsible for doing cross-domain requests.
 * @class Proxy
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberSockets - Sockets object.
 * @property {object} memberHttp - 'http' module.
 */
var Proxy = function(io) {

  // Sockets object
  var memberSockets = io.sockets;
  // 'http' module
  var memberHttp = require('http');

  // Socket connection event
  memberSockets.on('connection', function(client) {

    // Proxy request event
    client.on('proxyRequest', function(json) {

      // Http request to the received url
      memberHttp.get(json.url, function(resp){
        var xml = '';

        // Data receiving event
        resp.on('data', function(chunk) {
          xml += chunk;
        });

        // End of request event
        resp.on('end', function() {
          xml = xml.replace(/>\s*/g, '>');
          xml = xml.replace(/\s*</g, '<');

          // Socket response
          client.emit('proxyResponse', { msg: xml, requestId: json.requestId });
        });

      }).on("error", function(e){
        console.log("Got error: " + e.message);
      });
    });
  });
};

module.exports = Proxy;
