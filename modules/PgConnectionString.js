"use strict";

/** @class PgConnectionString - Module responsible for set the PostgreSQL connection string. */
var PgConnectionString = function() {

  var path = require('path'),
      databaseConfigurations = require(path.join(__dirname, '../configurations/Database.json'));

  /**
   * Return the schema
   * @returns {string} databaseConfigurations.Schema - schema
   */
  this.getSchema = function() {
    return databaseConfigurations.Schema;
  };

  /**
   * Return the connection string
   * @returns {string} connectionString - connection string
   */
  this.getConnectionString = function() {
    var connectionString = "postgres://" + databaseConfigurations.User + ":" + databaseConfigurations.Password + "@" + databaseConfigurations.Host + ":" + databaseConfigurations.Port + "/" + databaseConfigurations.Database;
    return connectionString;
  };
};

module.exports = PgConnectionString;
