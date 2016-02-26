"use strict";

/**
 * Filter model, which contains filter related database manipulations.
 * @class Filter
 *
 * @property {object} path - 'path' module.
 * @property {object} pgConnectionString - 'PgConnectionString' module.
 * @property {json} attributesTableConfig - Attributes table configuration.
 * @property {object} pg - 'pg' module.
 */
var Filter = function() {

  // 'path' module
  var path = require('path');
  // 'PgConnectionString' module
  var pgConnectionString = new (require(path.join(__dirname, '../modules/PgConnectionString.js')))();
  // Attributes table configuration
  var attributesTableConfig = require(path.join(__dirname, '../configurations/AttributesTable.json'));
  // 'pg' module
  var pg = require('pg');

  /**
   * Returns data of the attributes table accordingly with the received parameters.
   * @param {number} numberOfRegisters - Desired number of records
   * @param {number} initialRegister - Initial record
   * @param {array} order - 'order by' clause parameters
   * @param {string} search - String of the search
   * @param {string} dateFrom - Initial date
   * @param {string} dateTo - Final date
   * @param {json} options - Filtering options
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getAttributesTableData
   * @memberof Filter
   * @inner
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
        if(options.extent !== undefined)
          query += " and ST_Intersects(geom, ST_MakeEnvelope(" + options.extent[0] + ", " + options.extent[1] + ", " + options.extent[2] + ", " + options.extent[3] + ", 4326))";

        // If the the user executed a search in the table, a 'where' clause is created for it
        if(search !== '') {
          var searchResult = createSearch(search, parameter);
          query += searchResult.search;
          parameter = searchResult.parameter;
          params = params.concat(searchResult.params);
        }

        // Order and pagination clauses
        query += " order by " + orderText + " limit $" + (parameter++) + " offset $" + (parameter++) + ";";
        params.push(numberOfRegisters, initialRegister);

        // Execution of the query
        client.query(query, params, function(err, result) {
          done();
          if(!err) return callback(null, result);
          else return callback(err);
        });
      } else return callback(err);
    });
  };

  /**
   * Returns the number of rows of the attributes table accordingly with the received parameters, not considering the table search.
   * @param {string} dateFrom - Initial date
   * @param {string} dateTo - Final date
   * @param {json} options - Filtering options
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getAttributesTableCount
   * @memberof Filter
   * @inner
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
        if(options.extent !== undefined)
          query += " and ST_Intersects(geom, ST_MakeEnvelope(" + options.extent[0] + ", " + options.extent[1] + ", " + options.extent[2] + ", " + options.extent[3] + ", 4326))";

        // Execution of the query
        client.query(query, params, function(err, result) {
          done();
          if(!err) return callback(null, result);
          else return callback(err);
        });
      } else return callback(err);
    });
  };

  /**
   * Returns the number of rows of the attributes table accordingly with the received parameters, considering the table search.
   * @param {string} dateFrom - Initial date
   * @param {string} dateTo - Final date
   * @param {string} search - String of the search
   * @param {json} options - Filtering options
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getAttributesTableCountWithSearch
   * @memberof Filter
   * @inner
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
        if(options.extent !== undefined)
          query += " and ST_Intersects(geom, ST_MakeEnvelope(" + options.extent[0] + ", " + options.extent[1] + ", " + options.extent[2] + ", " + options.extent[3] + ", 4326))";

        // If the the user executed a search in the table, a 'where' clause is created for it
        if(search !== '') {
          var searchResult = createSearch(search, parameter);
          query += searchResult.search;
          parameter = searchResult.parameter;
          params = params.concat(searchResult.params);
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
   * Creates and returns the search 'where' clauses.
   * @param {string} search - Search text
   * @param {int} parameter - Parater counter
   * @returns {json} {} - JSON object with the search text, the parameter counter and the parameters array
   *
   * @private
   * @function createSearch
   * @memberof Filter
   * @inner
   */
  var createSearch = function(search, parameter) {
    var searchText = " and (";
    var params = [];

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
          params.push(Number(search));
        }
      }
    }
    searchText = searchText.substring(0, (searchText.length - 4)) + ")";

    return { "search": searchText, "parameter": parameter, "params": params };
  };
};

module.exports = Filter;
