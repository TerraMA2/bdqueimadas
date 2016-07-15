"use strict";

/**
 * Module responsible for setting the PostgreSQL connection pool.
 * @class PgConnectionPool
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberPath - 'path' module.
 * @property {object} memberDatabaseConfigurations - Database configurations.
 * @property {object} memberConfig - Configuration object.
 * @property {object} memberPool - Connection pool.
 */
var PgConnectionPool = function() {

  // 'path' module
  var memberPath = require('path');
  // Database configurations
  var memberDatabaseConfigurations = require(memberPath.join(__dirname, '../configurations/Database.json'));
  // Configuration object
  var memberConfig = null;
  // Connection pool
  var memberPool = null;

  /**
   * Returns the connection pool.
   * @returns {object} memberPool - Connection pool
   *
   * @function getConnectionPool
   * @memberof PgConnectionPool
   * @inner
   */
  this.getConnectionPool = function() {
    if(memberPool === null) {
      memberConfig = {
        user: memberDatabaseConfigurations.User,
        password: memberDatabaseConfigurations.Password,
        host: memberDatabaseConfigurations.Host,
        database: memberDatabaseConfigurations.Database,
        port: memberDatabaseConfigurations.Port,
        max: memberDatabaseConfigurations.MaxNumberOfClientsInThePool,
        idleTimeoutMillis: memberDatabaseConfigurations.IdleTimeoutMillis
      };

      var pg = require('pg');

      memberPool = new pg.Pool(memberConfig);

      memberPool.on('error', function(err, client) {
        console.error(err);
      });

      console.log("Pool created!");
    }

    return memberPool;
  };
};

module.exports = PgConnectionPool;
