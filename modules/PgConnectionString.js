"use strict";

var path = require('path'),
    databaseConfigurations = require(path.join(__dirname, '../configurations/Database.json'));

/** @module PgConnectionString - Module responsible for set the PostgreSQL connection string. */
var PgConnectionString = function() {};

/**
 * Return the schema
 * @returns {string} databaseConfigurations.Schema - schema
 */
PgConnectionString.getSchema = function() {
  return databaseConfigurations.Schema;
};

/**
 * Return the connection string
 * @returns {string} connectionString - connection string
 */
PgConnectionString.getConnectionString = function() {
  var connectionString = "postgres://" + databaseConfigurations.User + ":" + databaseConfigurations.Password + "@" + databaseConfigurations.Host + ":" + databaseConfigurations.Port + "/" + databaseConfigurations.Database;
  return connectionString;
};

module.exports = PgConnectionString;
