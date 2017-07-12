var pg = require('pg');
var fs = require('fs');
var path = require('path');

var databaseConfigurations = JSON.parse(fs.readFileSync(path.join(__dirname, './configurations/Database.json'), 'utf8'));

var pgPool = new pg.Pool({
  user: databaseConfigurations.User,
  password: databaseConfigurations.Password,
  host: databaseConfigurations.Host,
  database: databaseConfigurations.Database,
  port: databaseConfigurations.Port,
  max: databaseConfigurations.MaxNumberOfClientsInThePool,
  idleTimeoutMillis: databaseConfigurations.IdleTimeoutMillis
});

pgPool.on('error', function(err, client) {
  console.error(err);
});

module.exports = pgPool;