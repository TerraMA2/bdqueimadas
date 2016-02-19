var path = require('path'),
    pgConnector = require(path.join(__dirname, '../modules/pg-connector.js')),
    firesTableConfiguration = pgConnector.getFiresTableConfiguration(),
    db = pgConnector.getDb();

var foco = function() {};

foco.getPage = function(numberOfRegisters, initialRegister) {
  db.connect(function(err) {
    if(err) return console.error('could not connect to postgres', err);

    var query = 'select * from ' + pgConnector.getSchema() + '.' + firesTableConfiguration.Name +
                ' order by ' + firesTableConfiguration.DateFieldName + ', ' + firesTableConfiguration.TimeFieldName + ' asc limit ' +
                numberOfRegisters + ' offset ' + initialRegister + ' order;';

    db.query(query, function(err, result) {
      if(err) return console.error('error running query', err);

      db.end();

      return result;
    });
  });
};

module.exports = foco;
