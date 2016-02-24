var path = require('path'),
    databaseConfigurations = require(path.join(__dirname, '../configurations/database.json'));

var PgConnectionString = function() {};

PgConnectionString.getSchema = function() {
  return databaseConfigurations.Schema;
};

PgConnectionString.getConnectionString = function() {
  var connectionString = "postgres://" + databaseConfigurations.User + ":" + databaseConfigurations.Password + "@" + databaseConfigurations.Host + ":" + databaseConfigurations.Port + "/" + databaseConfigurations.Database;
  return connectionString;
};

module.exports = PgConnectionString;
