var path = require('path'),
    pgConnector = require(path.join(__dirname, '../modules/pg-connector.js')),
    firesTableConfiguration = pgConnector.getFiresTableConfiguration(),
    db = pgConnector.getDb();

var foco = function() {};

foco.getPage = function(numberOfRegisters, initialRegister, dateFrom, dateTo, options, callback) {
  db.connect(function(err) {
    if(!err) {
      var query = 'select * from ' + pgConnector.getSchema() + '.' + firesTableConfiguration.Name + ' where ' + firesTableConfiguration.DateFieldName + ' between ' + dateFrom + ' and ' + dateTo;
      if(options.satellite !== undefined) query += ' and ' + firesTableConfiguration.SatelliteFieldName + ' = ' + options.satellite;
      query += ' order by ' + firesTableConfiguration.DateFieldName + ', ' + firesTableConfiguration.TimeFieldName + ' asc ' + ' limit ' + numberOfRegisters + ' offset ' + initialRegister + ';';

      db.query(query, function(err, result) {
        if(!err) {
          db.end();
          return callback(null, result);
        } else return callback(err);
      });
    } else return callback(err);
  });
};

foco.getPageCount = function(dateFrom, dateTo, options, callback) {
  db.connect(function(err) {
    if(!err) {
      var query = 'select count(*) from ' + pgConnector.getSchema() + '.' + firesTableConfiguration.Name + ' where ' + firesTableConfiguration.DateFieldName + ' between ' + dateFrom + ' and ' + dateTo;
      if(options.satellite !== undefined) query += ' and ' + firesTableConfiguration.SatelliteFieldName + ' = ' + options.satellite;

      db.query(query, function(err, result) {
        if(!err) {
          db.end();
          return callback(null, result);
        } else return callback(err);
      });
    } else return callback(err);
  });
};

module.exports = foco;
