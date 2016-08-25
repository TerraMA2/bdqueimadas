var databaseConfigurations = require(require('path').join(__dirname, 'configurations/Database.json')),
    pg = require('pg'),
    config = {
      user: databaseConfigurations.User,
      password: databaseConfigurations.Password,
      host: databaseConfigurations.Host,
      database: databaseConfigurations.Database,
      port: databaseConfigurations.Port,
      max: databaseConfigurations.MaxNumberOfClientsInThePool,
      idleTimeoutMillis: databaseConfigurations.IdleTimeoutMillis
    },
    pool = new pg.Pool(config);

pool.on('error', function(err, client) {
  console.error(err);
});

module.exports = pool;
