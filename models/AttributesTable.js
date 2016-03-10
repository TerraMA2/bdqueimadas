"use strict";

/**
 * AttributesTable model, which contains attributes table related database manipulations.
 * @class AttributesTable
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberPath - 'path' module.
 * @property {object} memberPgConnectionString - 'PgConnectionString' module.
 * @property {json} memberAttributesTableConfig - Attributes table configuration.
 * @property {object} memberPg - 'pg' module.
 */
var AttributesTable = function() {

  // 'path' module
  var memberPath = require('path');
  // 'PgConnectionString' module
  var memberPgConnectionString = new (require(memberPath.join(__dirname, '../modules/PgConnectionString.js')))();
  // Attributes table configuration
  var memberAttributesTableConfig = require(memberPath.join(__dirname, '../configurations/AttributesTable.json'));
  // 'pg' module
  var memberPg = require('pg');

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
   * @memberof AttributesTable
   * @inner
   */
  this.getAttributesTableData = function(numberOfRegisters, initialRegister, order, search, dateFrom, dateTo, options, callback) {
    // Counter of the query parameters
    var parameter = 1;

    // Setting of the query columns string
    var columns = "";
    for(var i = 0; i < memberAttributesTableConfig.Columns.length; i++) {
      if(memberAttributesTableConfig.Columns[i].Show)
        columns += memberAttributesTableConfig.Columns[i].Name + ", ";
    }
    columns = columns.substring(0, (columns.length - 2));

    // Setting of the query 'order by' clause string
    var orderText = "";
    for(var i = 0; i < order.length; i++) {

      var direction = "asc";
      if(order[i].dir === "desc") direction = "desc";

      var column = memberAttributesTableConfig.Columns[0].Name;
      for(var j = 0; j < memberAttributesTableConfig.Columns.length; j++) {
        if(memberAttributesTableConfig.Columns[j].Name === order[i].column) {
          column = memberAttributesTableConfig.Columns[j].Name;
          break;
        }
      }

      orderText += column + " " + direction + ", ";
    }
    orderText = orderText.substring(0, (orderText.length - 2));

    // Connection with the PostgreSQL database
    memberPg.connect(memberPgConnectionString.getConnectionString(), function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "select " + columns + " from " + memberPgConnectionString.getSchema() + "." + memberAttributesTableConfig.Name + " where (" + memberAttributesTableConfig.DateFieldName + " between $" + (parameter++) + " and $" + (parameter++) + ")",
            params = [dateFrom, dateTo];

        // If the 'options.satellite' parameter exists, a satellite 'where' clause is created
        if(options.satellite !== undefined) {
          query += " and " + memberAttributesTableConfig.SatelliteFieldName + " = $" + (parameter++);
          params.push(options.satellite);
        }

        // If the 'options.extent' parameter exists, a satellite 'where' clause is created
        if(options.extent !== undefined) {
          query += " and ST_Intersects(" + memberAttributesTableConfig.GeometryFieldName + ", ST_MakeEnvelope($" + (parameter++) + ", $" + (parameter++) + ", $" + (parameter++) + ", $" + (parameter++) + ", 4326))";
          params.push(options.extent[0], options.extent[1], options.extent[2], options.extent[3]);
        }

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
   * @memberof AttributesTable
   * @inner
   */
  this.getAttributesTableCount = function(dateFrom, dateTo, options, callback) {
    // Counter of the query parameters
    var parameter = 1;

    // Connection with the PostgreSQL database
    memberPg.connect(memberPgConnectionString.getConnectionString(), function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "select count(*) from " + memberPgConnectionString.getSchema() + "." + memberAttributesTableConfig.Name + " where " + memberAttributesTableConfig.DateFieldName + " between $" + (parameter++) + " and $" + (parameter++),
            params = [dateFrom, dateTo];

        // If the 'options.satellite' parameter exists, a satellite 'where' clause is created
        if(options.satellite !== undefined) {
          query += " and " + memberAttributesTableConfig.SatelliteFieldName + " = $" + (parameter++);
          params.push(options.satellite);
        }

        // If the 'options.extent' parameter exists, a satellite 'where' clause is created
        if(options.extent !== undefined) {
          query += " and ST_Intersects(" + memberAttributesTableConfig.GeometryFieldName + ", ST_MakeEnvelope($" + (parameter++) + ", $" + (parameter++) + ", $" + (parameter++) + ", $" + (parameter++) + ", 4326))";
          params.push(options.extent[0], options.extent[1], options.extent[2], options.extent[3]);
        }

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
   * @memberof AttributesTable
   * @inner
   */
  this.getAttributesTableCountWithSearch = function(dateFrom, dateTo, search, options, callback) {
    // Counter of the query parameters
    var parameter = 1;

    // Connection with the PostgreSQL database
    memberPg.connect(memberPgConnectionString.getConnectionString(), function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "select count(*) from " + memberPgConnectionString.getSchema() + "." + memberAttributesTableConfig.Name + " where " + memberAttributesTableConfig.DateFieldName + " between $" + (parameter++) + " and $" + (parameter++),
            params = [dateFrom, dateTo];

        // If the 'options.satellite' parameter exists, a satellite 'where' clause is created
        if(options.satellite !== undefined) {
          query += " and " + memberAttributesTableConfig.SatelliteFieldName + " = $" + (parameter++);
          params.push(options.satellite);
        }

        // If the 'options.extent' parameter exists, a satellite 'where' clause is created
        if(options.extent !== undefined) {
          query += " and ST_Intersects(" + memberAttributesTableConfig.GeometryFieldName + ", ST_MakeEnvelope($" + (parameter++) + ", $" + (parameter++) + ", $" + (parameter++) + ", $" + (parameter++) + ", 4326))";
          params.push(options.extent[0], options.extent[1], options.extent[2], options.extent[3]);
        }

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
          if(!err) return callback(null, result);
          else return callback(err);
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
   * @memberof AttributesTable
   * @inner
   */
  var createSearch = function(search, parameter) {
    var searchText = " and (";
    var params = [];

    // Loop through the columns configuration
    for(var i = 0; i < memberAttributesTableConfig.Columns.length; i++) {

      // If the column is set to be shown in the table, it's included in the search, otherwise it's not
      if(memberAttributesTableConfig.Columns[i].Show) {

        // Verification of the type of the column (numeric or not numeric)
        if(!memberAttributesTableConfig.Columns[i].Number) {
          searchText += memberAttributesTableConfig.Columns[i].Name + " like $" + (parameter++) + " or ";
          params.push('%' + search + '%');
        } else if(memberAttributesTableConfig.Columns[i].Number && !isNaN(search)) {
          searchText += memberAttributesTableConfig.Columns[i].Name + " = $" + (parameter++) + " or ";
          params.push(Number(search));
        }
      }
    }
    searchText = searchText.substring(0, (searchText.length - 4)) + ")";

    return { "search": searchText, "parameter": parameter, "params": params };
  };
};

module.exports = AttributesTable;
