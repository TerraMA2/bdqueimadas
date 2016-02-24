var path = require('path'),
    pgConnectionString = require(path.join(__dirname, '../modules/PgConnectionString.js')),
    firesTableConfiguration = require(path.join(__dirname, '../configurations/attributestable.json')),
    conString = pgConnectionString.getConnectionString(),
    pg = require('pg');

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

  pg.connect(conString, function(err, client, done) {
    if(!err) {
      var query = "select " + columns + " from " + pgConnectionString.getSchema() + "." + firesTableConfiguration.Name + " where (" +
                  firesTableConfiguration.DateFieldName + " between $" + (parameter++) + " and $" + (parameter++) + ")",
          params = [dateFrom, dateTo];

      if(options.satellite !== undefined) {
        query += " and " + firesTableConfiguration.SatelliteFieldName + " = $" + (parameter++);
        params.push(options.satellite);
      }

      if(options.extent !== undefined) {
        query += " and ST_Intersects(geom, ST_MakeEnvelope(" + options.extent[0] + ", " + options.extent[1] + ", " + options.extent[2] + ", " + options.extent[3] + ", 4326))";
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

      client.query(query, params, function(err, result) {
        done();
        if(!err) {
          return callback(null, result);
        } else return callback(err);
      });
    } else return callback(err);
  });
};

Filter.getAttributesTableCount = function(dateFrom, dateTo, options, callback) {
  var parameter = 1;

  pg.connect(conString, function(err, client, done) {
    if(!err) {
      var query = "select count(*) from " + pgConnectionString.getSchema() + "." + firesTableConfiguration.Name + " where " +
                  firesTableConfiguration.DateFieldName + " between $" + (parameter++) + " and $" + (parameter++),
          params = [dateFrom, dateTo];

      if(options.satellite !== undefined) {
        query += " and " + firesTableConfiguration.SatelliteFieldName + " = $" + (parameter++);
        params.push(options.satellite);
      }

      if(options.extent !== undefined) {
        query += " and ST_Intersects(geom, ST_MakeEnvelope(" + options.extent[0] + ", " + options.extent[1] + ", " + options.extent[2] + ", " + options.extent[3] + ", 4326))";
      }

      client.query(query, params, function(err, result) {
        done();
        if(!err) {
          return callback(null, result);
        } else return callback(err);
      });
    } else return callback(err);
  });
};

Filter.getAttributesTableCountWithSearch = function(dateFrom, dateTo, search, options, callback) {
  var parameter = 1;

  pg.connect(conString, function(err, client, done) {
    if(!err) {
      var query = "select count(*) from " + pgConnectionString.getSchema() + "." + firesTableConfiguration.Name + " where " +
      firesTableConfiguration.DateFieldName + " between $" + (parameter++) + " and $" + (parameter++),
          params = [dateFrom, dateTo];

      if(options.satellite !== undefined) {
        query += " and " + firesTableConfiguration.SatelliteFieldName + " = $" + (parameter++);
        params.push(options.satellite);
      }

      if(options.extent !== undefined) {
        query += " and ST_Intersects(geom, ST_MakeEnvelope(" + options.extent[0] + ", " + options.extent[1] + ", " + options.extent[2] + ", " + options.extent[3] + ", 4326))";
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

      client.query(query, params, function(err, result) {
        done();
        if(!err) {
          return callback(null, result);
        } else return callback(err);
      });
    } else return callback(err);
  });
};

module.exports = Filter;
