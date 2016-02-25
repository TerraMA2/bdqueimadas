"use strict";

/**
 * Module responsible for set the PostgreSQL connection string.
 * @class PgConnectionString
 *
 * @property {object} path - 'path' module.
 * @property {json} databaseConfigurations - Database configurations.
 */
var PgConnectionString = function() {

  // 'path' module
  var path = require('path');
  // Database configurations
  var databaseConfigurations = require(path.join(__dirname, '../configurations/Database.json'));

  /**
   * Returns the schema.
   * @returns {string} databaseConfigurations.Schema - Schema
   *
   * @function getSchema
   * @memberof PgConnectionString
   * @inner
   */
  this.getSchema = function() {
    return databaseConfigurations.Schema;
  };

  /**
   * Returns the connection string.
   * @returns {string} connectionString - Connection string
   *
   * @function getConnectionString
   * @memberof PgConnectionString
   * @inner
   */
  this.getConnectionString = function() {
    var connectionString = "postgres://" + databaseConfigurations.User + ":" + databaseConfigurations.Password + "@" + databaseConfigurations.Host + ":" + databaseConfigurations.Port + "/" + databaseConfigurations.Database;
    return connectionString;
  };
};

module.exports = PgConnectionString;
