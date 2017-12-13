"use strict";

/**
 * Socket responsible for doing cross-domain requests.
 * @class Proxy
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberSockets - Sockets object.
 * @property {object} memberHttp - 'http' module.
 * @property {object} memberHttps - 'https' module.
 * @property {object} memberPath - 'path' module.
 * @property {object} memberFs - 'fs' module.
 * @property {object} memberPiwikConfigurations - Piwik configurations.
 * @property {object} memberFilter - Filter model.
 */
var Proxy = function(io) {

  // Sockets object
  var memberSockets = io.sockets;
  // 'http' module
  var memberHttp = require('http');
  // 'https' module
  var memberHttps = require('https');
  // 'path' module
  var memberPath = require('path');
  // 'fs' module
  var memberFs = require('fs');
  // Piwik configurations
  var memberPiwikConfigurations = JSON.parse(memberFs.readFileSync(memberPath.join(__dirname, '../configurations/Piwik.json'), 'utf8'));
  // Filter model
  var memberFilter = new (require('../models/Filter.js'))();

  // Socket connection event
  memberSockets.on('connection', function(client) {

    // Proxy request event
    client.on('proxyRequest', function(json) {

      var requestObject = json.url.substring(0, 5) === "https" ? memberHttps : memberHttp;

      // Http request to the received url
      requestObject.get(json.url, function(resp) {
        var body = '';

        // Data receiving event
        resp.on('data', function(chunk) {
          body += chunk;
        });

        // End of request event
        resp.on('end', function() {
          if(json.format === 'xml') {
            body = body.replace(/>\s*/g, '>');
            body = body.replace(/\s*</g, '<');
          } else if(json.format === 'json') {
            try {
              body = JSON.parse(body);
            } catch(ex) {
              body = {};
            }
          }

          if(json.requestId == 'GetFeatureInfoTool')
            client.emit('proxyResponse', { msg: body, requestId: json.requestId });
          else
            client.emit('proxyResponse', { msg: body, requestId: json.requestId });
        });

      }).on("error", function(e) {
        console.error(e.message);
      });
    });

    // Piwik data request event
    client.on('piwikDataRequest', function(json) {
      var initialDate = (json !== undefined && json !== null && json.initialDate !== undefined && json.initialDate !== null ? json.initialDate : "2016-07-25");

      if(json !== undefined && json !== null && json.finalDate !== undefined && json.finalDate !== null)
        var finalDate = json.finalDate;
      else {
        var date = new Date();
        var year = date.getFullYear(),
            month = ((date.getMonth() + 1) < 10) ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1),
            day = (date.getDate() < 10) ? "0" + date.getDate() : date.getDate();

        var finalDate = year + "-" + month + "-" + day;
      }

      var url = memberPiwikConfigurations.Url + "/index.php?module=API&method=API.getBulkRequest&format=json&token_auth=" + memberPiwikConfigurations.TokenAuth + "&urls[0]=method=VisitsSummary.get&idSite=" + memberPiwikConfigurations.IdSite + "&period=range&date=" + initialDate + "," + finalDate;

      var requestObject = url.substring(0, 5) === "https" ? memberHttps : memberHttp;

      // Http request to the Piwik url
      requestObject.get(url, function(resp) {
        var body = '';

        // Data receiving event
        resp.on('data', function(chunk) {
          body += chunk;
        });

        // End of request event
        resp.on('end', function() {
          try {
            body = JSON.parse(body);
          } catch(ex) {
            body = {};
          }

          // Socket response
          client.emit('piwikDataResponse', { piwikData: body });
        });
      }).on("error", function(e) {
        console.error(e.message);
      });
    });
  });
};

module.exports = Proxy;
