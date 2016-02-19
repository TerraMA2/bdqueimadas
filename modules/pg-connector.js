var pg = require('pg').native,
    path = require('path'),
    databaseConfigurations = require(path.join(__dirname, '../configurations/database.json'));

var pgConnector = function() {};

pgConnector.getDb = function() {
  if(typeof pgConnector.db === 'undefined') {
    pgConnector.initDb();
  }
  return pgConnector.db;
};

pgConnector.getSchema = function() {
  return databaseConfigurations.Schema;
};

pgConnector.getFiresTableConfiguration = function() {
  return databaseConfigurations.FiresTable;
};

pgConnector.initDb = function() {
  var connectionString = "postgres://" + databaseConfigurations.User + ":" + databaseConfigurations.Password + "@" + databaseConfigurations.Host + ":" + databaseConfigurations.Port + "/" + databaseConfigurations.Database;
  pgConnector.db = new pg.Client(connectionString);
};

module.exports = pgConnector;
