var pg = require('pg').native,
    path = require('path'),
    databaseConfigurations = require(path.join(__dirname, '../configurations/database.json'));

var PgConnector = function() {};

PgConnector.getDb = function() {
  if(typeof PgConnector.db === 'undefined') {
    PgConnector.initDb();
  }
  return PgConnector.db;
};

PgConnector.getSchema = function() {
  return databaseConfigurations.Schema;
};

PgConnector.getFiresTableConfiguration = function() {
  return databaseConfigurations.FiresTable;
};

PgConnector.initDb = function() {
  var connectionString = "postgres://" + databaseConfigurations.User + ":" + databaseConfigurations.Password + "@" + databaseConfigurations.Host + ":" + databaseConfigurations.Port + "/" + databaseConfigurations.Database;
  PgConnector.db = new pg.Client(connectionString);
};

module.exports = PgConnector;
