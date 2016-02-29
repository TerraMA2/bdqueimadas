"use strict";

/**
 * Socket responsible for doing cross-domain requests.
 * @class Proxy
 */
var Proxy = function(io) {

  var sockets = io.sockets;
  var http = require('http');

  // Socket connection event
  sockets.on('connection', function(client) {

    // Proxy request event
    client.on('proxyRequest', function(json) {

      // Http request to the received url
      http.get(json.url, function(resp){
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
