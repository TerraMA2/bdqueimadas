"use strict";

/**
 * Graphics model, which contains graphics related database manipulations.
 * @class Graphics
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberPath - 'path' module.
 * @property {object} memberPgConnectionString - 'PgConnectionString' module.
 * @property {json} memberTablesConfig - Tables configuration.
 * @property {object} memberPg - 'pg' module.
 */
var Graphics = function() {

  // 'path' module
  var memberPath = require('path');
  // 'PgConnectionString' module
  var memberPgConnectionString = new (require(memberPath.join(__dirname, '../modules/PgConnectionString.js')))();
  // Tables configuration
  var memberTablesConfig = require(memberPath.join(__dirname, '../configurations/Tables.json'));
  // 'pg' module
  var memberPg = require('pg');

  /**
   * Returns the center cordinates of the country correspondent to the received id.
   * @param {number} countryId - Country id
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getCountryCenter
   * @memberof Graphics
   * @inner
   */
  this.getFiresCountBySatellite = function(countryId, callback) {
    // Connection with the PostgreSQL database
    memberPg.connect(memberPgConnectionString.getConnectionString(), function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "select ST_AsText(ST_Centroid(" + memberTablesConfig.Countries.GeometryFieldName + ")) from " + memberPgConnectionString.getSchema() + "." + memberTablesConfig.Countries.TableName + " where " + memberTablesConfig.Countries.IdFieldName + " = $1;",
            params = [countryId];

        // Execution of the query
        client.query(query, params, function(err, result) {
          done();
          if(!err) return callback(null, result);
          else return callback(err);
        });
      } else return callback(err);
    });
  };
};

module.exports = Graphics;
