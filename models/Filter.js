"use strict";

/** @class Filter - Filter model, which contain filter related database manipulations. */
var Filter = function() {

  var path = require('path'),
      pgConnectionString = new (require(path.join(__dirname, '../modules/PgConnectionString.js')))(),
      attributesTableConfig = require(path.join(__dirname, '../configurations/AttributesTable.json')),
      pg = require('pg');

  /**
   * Returns data of the attributes table accordingly with the received parameters
   * @param {number} numberOfRegisters - desired number of records
   * @param {number} initialRegister - initial record
   * @param {array} order - 'order by' clause parameters
   * @param {string} search - string of the search
   * @param {string} dateFrom - initial date
   * @param {string} dateTo - final date
   * @param {json} options - filtering options
   * @param {function} callback - callback function
   * @returns {function} callback - execution of the callback function
   */
  this.getAttributesTableData = function(numberOfRegisters, initialRegister, order, search, dateFrom, dateTo, options, callback) {
    // Counter of the query parameters
    var parameter = 1;

    // Setting of the query columns string
    var columns = "";
    for(var i = 0; i < attributesTableConfig.Columns.length; i++) {
      if(attributesTableConfig.Columns[i].Show)
        columns += attributesTableConfig.Columns[i].Name + ", ";
    }
    columns = columns.substring(0, (columns.length - 2));

    // Setting of the query 'order by' clause string
    var orderText = "";
    for(var i = 0; i < order.length; i++) orderText += order[i].column + " " + order[i].dir + ", ";
    orderText = orderText.substring(0, (orderText.length - 2));

    // Connection with the PostgreSQL database
    pg.connect(pgConnectionString.getConnectionString(), function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "select " + columns + " from " + pgConnectionString.getSchema() + "." + attributesTableConfig.Name + " where (" + attributesTableConfig.DateFieldName + " between $" + (parameter++) + " and $" + (parameter++) + ")",
            params = [dateFrom, dateTo];

        // If the 'options.satellite' parameter exists, a satellite 'where' clause is created
        if(options.satellite !== undefined) {
          query += " and " + attributesTableConfig.SatelliteFieldName + " = $" + (parameter++);
          params.push(options.satellite);
        }

        // If the 'options.extent' parameter exists, a satellite 'where' clause is created
        if(options.extent !== undefined) {
          query += " and ST_Intersects(geom, ST_MakeEnvelope(" + options.extent[0] + ", " + options.extent[1] + ", " + options.extent[2] + ", " + options.extent[3] + ", 4326))";
        }

        // If the the user executed a search in the table, a 'where' clause is created for it
        if(search !== '') {
          var searchText = " and (";

          // Loop through the columns configuration
          for(var i = 0; i < attributesTableConfig.Columns.length; i++) {

            // If the column is set to be shown in the table, it's included in the search, otherwise it's not
            if(attributesTableConfig.Columns[i].Show) {

              // Verification of the type of the column (numeric or not numeric)
              if(!attributesTableConfig.Columns[i].Number) {
                searchText += attributesTableConfig.Columns[i].Name + " like $" + (parameter++) + " or ";
                params.push('%' + search + '%');
              } else if(attributesTableConfig.Columns[i].Number && !isNaN(search)) {
                searchText += attributesTableConfig.Columns[i].Name + " = $" + (parameter++) + " or ";
                params.push(parseInt(search));
              }
            }
          }
          searchText = searchText.substring(0, (searchText.length - 4)) + ")";
          query += searchText;
        }

        // Order and pagination clauses
        query += " order by " + orderText + " limit $" + (parameter++) + " offset $" + (parameter++) + ";";
        params.push(numberOfRegisters, initialRegister);

        // Execution of the query
        client.query(query, params, function(err, result) {
          done();
          if(!err) {
            return callback(null, result);
          } else return callback(err);
        });
      } else return callback(err);
    });
  };

  /**
   * Returns the number of rows of the attributes table accordingly with the received parameters, not considering the table search
   * @param {string} dateFrom - initial date
   * @param {string} dateTo - final date
   * @param {json} options - filtering options
   * @param {function} callback - callback function
   * @returns {function} callback - execution of the callback function
   */
  this.getAttributesTableCount = function(dateFrom, dateTo, options, callback) {
    // Counter of the query parameters
    var parameter = 1;

    // Connection with the PostgreSQL database
    pg.connect(pgConnectionString.getConnectionString(), function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "select count(*) from " + pgConnectionString.getSchema() + "." + attributesTableConfig.Name + " where " + attributesTableConfig.DateFieldName + " between $" + (parameter++) + " and $" + (parameter++),
            params = [dateFrom, dateTo];

        // If the 'options.satellite' parameter exists, a satellite 'where' clause is created
        if(options.satellite !== undefined) {
          query += " and " + attributesTableConfig.SatelliteFieldName + " = $" + (parameter++);
          params.push(options.satellite);
        }

        // If the 'options.extent' parameter exists, a satellite 'where' clause is created
        if(options.extent !== undefined) {
          query += " and ST_Intersects(geom, ST_MakeEnvelope(" + options.extent[0] + ", " + options.extent[1] + ", " + options.extent[2] + ", " + options.extent[3] + ", 4326))";
        }

        // Execution of the query
        client.query(query, params, function(err, result) {
          done();
          if(!err) {
            return callback(null, result);
          } else return callback(err);
        });
      } else return callback(err);
    });
  };

  /**
   * Returns the number of rows of the attributes table accordingly with the received parameters, considering the table search
   * @param {string} dateFrom - initial date
   * @param {string} dateTo - final date
   * @param {string} search - string of the search
   * @param {json} options - filtering options
   * @param {function} callback - callback function
   * @returns {function} callback - execution of the callback function
   */
  this.getAttributesTableCountWithSearch = function(dateFrom, dateTo, search, options, callback) {
    // Counter of the query parameters
    var parameter = 1;

    // Connection with the PostgreSQL database
    pg.connect(pgConnectionString.getConnectionString(), function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "select count(*) from " + pgConnectionString.getSchema() + "." + attributesTableConfig.Name + " where " + attributesTableConfig.DateFieldName + " between $" + (parameter++) + " and $" + (parameter++),
            params = [dateFrom, dateTo];

        // If the 'options.satellite' parameter exists, a satellite 'where' clause is created
        if(options.satellite !== undefined) {
          query += " and " + attributesTableConfig.SatelliteFieldName + " = $" + (parameter++);
          params.push(options.satellite);
        }

        // If the 'options.extent' parameter exists, a satellite 'where' clause is created
        if(options.extent !== undefined) {
          query += " and ST_Intersects(geom, ST_MakeEnvelope(" + options.extent[0] + ", " + options.extent[1] + ", " + options.extent[2] + ", " + options.extent[3] + ", 4326))";
        }

        // If the the user executed a search in the table, a 'where' clause is created for it
        if(search !== '') {
          var searchText = " and (";

          // Loop through the columns configuration
          for(var i = 0; i < attributesTableConfig.Columns.length; i++) {

            // If the column is set to be shown in the table, it's included in the search, otherwise it's not
            if(attributesTableConfig.Columns[i].Show) {

              // Verification of the type of the column (numeric or not numeric)
              if(!attributesTableConfig.Columns[i].Number) {
                searchText += attributesTableConfig.Columns[i].Name + " like $" + (parameter++) + " or ";
                params.push('%' + search + '%');
              } else if(attributesTableConfig.Columns[i].Number && !isNaN(search)) {
                searchText += attributesTableConfig.Columns[i].Name + " = $" + (parameter++) + " or ";
                params.push(parseInt(search));
              }
            }
          }
          searchText = searchText.substring(0, (searchText.length - 4)) + ")";
          query += searchText;
        }

        // Execution of the query
        client.query(query, params, function(err, result) {
          done();
          if(!err) {
            return callback(null, result);
          } else return callback(err);
        });
      } else return callback(err);
    });
  };
};

module.exports = Filter;
