"use strict";

/**
 * Module responsible for set the PostgreSQL connection string.
 * @class PgConnectionString
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberPath - 'path' module.
 * @property {json} memberDatabaseConfigurations - Database configurations.
 */
var PgConnectionString = function() {

  // 'path' module
  var memberPath = require('path');
  // Database configurations
  var memberDatabaseConfigurations = require(memberPath.join(__dirname, '../configurations/Database'));

  /**
   * Returns the connection string.
   * @returns {string} connectionString - Connection string
   *
   * @function getConnectionString
   * @memberof PgConnectionString
   * @inner
   */
  this.getConnectionString = function() {
    var connectionString = "postgres://" + memberDatabaseConfigurations.User + ":" + memberDatabaseConfigurations.Password + "@" + memberDatabaseConfigurations.Host + ":" + memberDatabaseConfigurations.Port + "/" + memberDatabaseConfigurations.Database;
    return connectionString;
  };
};

module.exports = PgConnectionString;
