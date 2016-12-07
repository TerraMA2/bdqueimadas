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

    // Fires count graphics request event
    client.on('graphicsFiresCountRequest', function(json) {
      // Object responsible for keep several information to be used in the database query
      var options = {};

      // Verifications of the 'options' object items
      if(json.satellites !== '') options.satellites = json.satellites;
      if(json.biomes !== '') options.biomes = json.biomes;
      if(json.continent !== undefined && json.continent !== null && json.continent !== '') options.continent = json.continent;
      if(json.countries !== null && json.countries !== '') options.countries = json.countries;
      if(json.states !== null && json.states !== '') options.states = json.states;
      if(json.cities !== null && json.cities !== '') options.cities = json.cities;
      if(json.protectedArea !== null && json.protectedArea !== '') options.protectedArea = json.protectedArea;
      if(json.limit !== null) options.limit = json.limit;
      if(json.y !== null) options.y = json.y;

      memberGraphics.getFiresTotalCount(client.pgPool, json.dateTimeFrom, json.dateTimeTo, json.filterRules, options, function(err, firesTotalCount) {
        if(err) return console.error(err);

        if(json.key === "week") {
          memberGraphics.getFiresCountByWeek(client.pgPool, json.dateTimeFrom, json.dateTimeTo, json.filterRules, options, function(err, firesCount) {
            if(err) return console.error(err);

            client.emit('graphicsFiresCountResponse', { firesCount: firesCount, firesTotalCount: firesTotalCount, id: json.id, y: json.y, key: json.key, title: json.title, limit: json.limit, filterRules: json.filterRules });
          });
        } else if(json.key === "UCE" || json.key === "UCF" || json.key === "TI" || json.key === "UCE_5KM" || json.key === "UCF_5KM" || json.key === "TI_5KM" || json.key === "UCE_10KM" || json.key === "UCF_10KM" || json.key === "TI_10KM") {
          memberGraphics.getFiresCountByPA(client.pgPool, json.dateTimeFrom, json.dateTimeTo, json.key, json.filterRules, options, function(err, firesCount) {
            if(err) return console.error(err);

            client.emit('graphicsFiresCountResponse', { firesCount: firesCount, firesTotalCount: firesTotalCount, id: json.id, y: json.y, key: json.key, title: json.title, limit: json.limit, filterRules: json.filterRules });
          });
        } else {
          memberGraphics.getFiresCount(client.pgPool, json.dateTimeFrom, json.dateTimeTo, json.key, json.filterRules, options, function(err, firesCount) {
            if(err) return console.error(err);

            client.emit('graphicsFiresCountResponse', { firesCount: firesCount, firesTotalCount: firesTotalCount, id: json.id, y: json.y, key: json.key, title: json.title, limit: json.limit, filterRules: json.filterRules });
          });
        }
      });
    });
  });
};

module.exports = Graphics;
