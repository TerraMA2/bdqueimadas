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
   * Callback of the database operations.
   * @callback Graphics~databaseOperationCallback
   * @param {error} err - Error
   * @param {json} result - Result of the operation
   */

  /**
   * Returns the count of the fires grouped by satellites.
   * @param {databaseOperationCallback} callback - Callback function
   * @returns {databaseOperationCallback} callback - Execution of the callback function, which will process the received data
   *
   * @function getFiresCountBySatellite
   * @memberof Graphics
   * @inner
   */
  this.getFiresCountBySatellite = function(callback) {
    // Connection with the PostgreSQL database
    memberPg.connect(memberPgConnectionString.getConnectionString(), function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "select " + memberTablesConfig.Fires.SatelliteFieldName + ", count(*) as " + memberTablesConfig.Fires.CountAlias + " from " +
        memberPgConnectionString.getSchema() + "." + memberTablesConfig.Fires.TableName + " group by " + memberTablesConfig.Fires.SatelliteFieldName +
        " order by " + memberTablesConfig.Fires.CountAlias + " desc;";

        // Execution of the query
        client.query(query, function(err, result) {
          done();
          if(!err) return callback(null, result);
          else return callback(err);
        });
      } else return callback(err);
    });
  };
};

module.exports = Graphics;
