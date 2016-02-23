var path = require('path'),
    pgConnector = require(path.join(__dirname, '../modules/PgConnector.js')),
    firesTableConfiguration = require(path.join(__dirname, '../configurations/attributestable.json')),
    db = pgConnector.getDb();

var Filter = function() {};

Filter.getAttributesTablePage = function(numberOfRegisters, initialRegister, order, search, dateFrom, dateTo, options, callback) {
  var parameter = 1;

  var columns = "";

  for(var i = 0; i < firesTableConfiguration.Columns.length; i++) {
    if(firesTableConfiguration.Columns[i].Show)
      columns += firesTableConfiguration.Columns[i].Name + ", ";
  }

  columns = columns.substring(0, (columns.length - 2));

  var orderText = "";
  for(var i = 0; i < order.length; i++) orderText += order[i].column + " " + order[i].dir + ", ";
  orderText = orderText.substring(0, (orderText.length - 2));

  db.connect(function(err) {
    if(!err) {
      var query = "select " + columns + " from " + pgConnector.getSchema() + "." + firesTableConfiguration.Name + " where (" +
                  firesTableConfiguration.DateFieldName + " between $" + (parameter++) + " and $" + (parameter++) + ")",
          params = [dateFrom, dateTo];

      if(options.satellite !== undefined) {
        query += " and " + firesTableConfiguration.SatelliteFieldName + " = $" + (parameter++);
        params.push(options.satellite);
      }

      if(search !== '') {
        var searchText = " and (";
        for(var i = 0; i < firesTableConfiguration.Columns.length; i++) {
          if(firesTableConfiguration.Columns[i].Show) {
            if(!firesTableConfiguration.Columns[i].Number) {
              searchText += firesTableConfiguration.Columns[i].Name + " like $" + (parameter++) + " or ";
              params.push('%' + search + '%');
            } else if(firesTableConfiguration.Columns[i].Number && !isNaN(search)) {
              searchText += firesTableConfiguration.Columns[i].Name + " = $" + (parameter++) + " or ";
              params.push(parseInt(search));
            }
          }
        }
        searchText = searchText.substring(0, (searchText.length - 4)) + ")";
        query += searchText;
      }

      query += " order by " + orderText + " limit $" + (parameter++) + " offset $" + (parameter++) + ";";
      params.push(numberOfRegisters, initialRegister);

      //console.log(query);
      //console.log(params);

      db.query(query, params, function(err, result) {
        if(!err) {
          db.end();
          return callback(null, result);
        } else return callback(err);
      });
    } else return callback(err);
  });
};

Filter.getAttributesTableCount = function(dateFrom, dateTo, options, callback) {
  var parameter = 1;

  db.connect(function(err) {
    if(!err) {
      var query = "select count(*) from " + pgConnector.getSchema() + "." + firesTableConfiguration.Name + " where " +
                  firesTableConfiguration.DateFieldName + " between $" + (parameter++) + " and $" + (parameter++),
          params = [dateFrom, dateTo];

      if(options.satellite !== undefined) {
        query += " and " + firesTableConfiguration.SatelliteFieldName + " = $" + (parameter++);
        params.push(options.satellite);
      }

      db.query(query, params, function(err, result) {
        if(!err) {
          db.end();
          return callback(null, result);
        } else return callback(err);
      });
    } else return callback(err);
  });
};

Filter.getAttributesTableCountWithSearch = function(dateFrom, dateTo, search, options, callback) {
  var parameter = 1;

  db.connect(function(err) {
    if(!err) {
      var query = "select count(*) from " + pgConnector.getSchema() + "." + firesTableConfiguration.Name + " where " +
      firesTableConfiguration.DateFieldName + " between $" + (parameter++) + " and $" + (parameter++),
          params = [dateFrom, dateTo];

      if(options.satellite !== undefined) {
        query += " and " + firesTableConfiguration.SatelliteFieldName + " = $" + (parameter++);
        params.push(options.satellite);
      }

      if(search !== '') {
        var searchText = " and (";
        for(var i = 0; i < firesTableConfiguration.Columns.length; i++) {
          if(firesTableConfiguration.Columns[i].Show) {
            if(!firesTableConfiguration.Columns[i].Number) {
              searchText += firesTableConfiguration.Columns[i].Name + " like $" + (parameter++) + " or ";
              params.push('%' + search + '%');
            } else if(firesTableConfiguration.Columns[i].Number && !isNaN(search)) {
              searchText += firesTableConfiguration.Columns[i].Name + " = $" + (parameter++) + " or ";
              params.push(parseInt(search));
            }
          }
        }
        searchText = searchText.substring(0, (searchText.length - 4)) + ")";
        query += searchText;
      }

      db.query(query, params, function(err, result) {
        if(!err) {
          db.end();
          return callback(null, result);
        } else return callback(err);
      });
    } else return callback(err);
  });
};

module.exports = Filter;
