"use strict";

/**
 * Downloads model, which contains attributes table related database manipulations.
 * @class Downloads
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberPath - 'path' module.
 * @property {json} memberTablesConfig - Tables configuration.
 * @property {object} memberUtils - 'Utils' model.
 * @property {object} memberPgPool - PostgreSQL connection pool.
 */
var Downloads = function() {

  // 'path' module
  var memberPath = require('path');
  // Tables configuration
  var memberTablesConfig = require(memberPath.join(__dirname, '../../configurations/Tables.json'));
  // 'Utils' model
  var memberUtils = new (require('./../Utils.js'))();
  // PostgreSQL connection pool
  var memberPgPool = require('../../pg');

  /**
   * Returns data of the attributes table accordingly with the received parameters.
   * @param {number} numberOfRegisters - Desired number of records
   * @param {number} initialRegister - Initial record
   * @param {string} search - String of the search
   * @param {string} dateTimeFrom - Initial date / time
   * @param {string} dateTimeTo - Final date / time
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getDownloadsTableData
   * @memberof Downloads
   * @inner
   */
  this.getDownloadsTableData = function(numberOfRegisters, initialRegister, search, dateTimeFrom, dateTimeTo, callback) {
    // Counter of the query parameters
    var parameter = 1;

    // Connection with the PostgreSQL database
    memberPgPool.connect(function(err, client, done) {
      if(!err) {
        var columns = "to_char((data_hora at time zone 'UTC') at time zone 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI:SS') as data_hora_char, ip, " +
        "to_char(filtro_inicio, 'DD/MM/YYYY HH24:MI:SS') as filtro_inicio, to_char(filtro_fim, 'DD/MM/YYYY HH24:MI:SS') as filtro_fim, filtro_satelites, filtro_biomas, filtro_paises, filtro_estados, filtro_cidades, filtro_formato";

        // Creation of the query
        var query = "select " + columns + " from " + memberTablesConfig.Downloads.Schema + "." + memberTablesConfig.Downloads.TableName + " where (" + memberTablesConfig.Downloads.DateTimeFieldName + " between $" + (parameter++) + " and $" + (parameter++) + ")",
            params = [dateTimeFrom, dateTimeTo];

        // If the the user executed a search in the table, a 'where' clause is created for it
        if(search !== '') {
          var searchResult = createSearch(search, parameter);
          query += searchResult.search;
          parameter = searchResult.parameter;
          params = params.concat(searchResult.params);
        }

        // Order and pagination clauses
        query += " order by " + memberTablesConfig.Downloads.DateTimeFieldName + " desc limit $" + (parameter++) + " offset $" + (parameter++) + ";";
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
   * @param {string} dateTimeFrom - Initial date / time
   * @param {string} dateTimeTo - Final date / time
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getDownloadsTableCount
   * @memberof Downloads
   * @inner
   */
  this.getDownloadsTableCount = function(dateTimeFrom, dateTimeTo, callback) {
    // Counter of the query parameters
    var parameter = 1;

    // Connection with the PostgreSQL database
    memberPgPool.connect(function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "select count(*) from " + memberTablesConfig.Downloads.Schema + "." + memberTablesConfig.Downloads.TableName + " where " + memberTablesConfig.Downloads.DateTimeFieldName + " between $" + (parameter++) + " and $" + (parameter++),
            params = [dateTimeFrom, dateTimeTo];

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
   * @param {string} dateTimeFrom - Initial date / time
   * @param {string} dateTimeTo - Final date / time
   * @param {string} search - String of the search
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getDownloadsTableCountWithSearch
   * @memberof Downloads
   * @inner
   */
  this.getDownloadsTableCountWithSearch = function(dateTimeFrom, dateTimeTo, search, callback) {
    // Counter of the query parameters
    var parameter = 1;

    // Connection with the PostgreSQL database
    memberPgPool.connect(function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "select count(*) from " + memberTablesConfig.Downloads.Schema + "." + memberTablesConfig.Downloads.TableName + " where " + memberTablesConfig.Downloads.DateTimeFieldName + " between $" + (parameter++) + " and $" + (parameter++),
            params = [dateTimeFrom, dateTimeTo];

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
   * @memberof Downloads
   * @inner
   */
  var createSearch = function(search, parameter) {
    var searchText = " and (" + memberTablesConfig.Downloads.IpFieldName + " like $" + (parameter++) + " or " + 
    memberTablesConfig.Downloads.FilterFormatFieldName + " like $" + (parameter++) + " or " +
    "unnest(" + memberTablesConfig.Downloads.FilterSatellitesFieldName + ") ilike $" + (parameter++) + " or " + 
    "unnest(" + memberTablesConfig.Downloads.FilterBiomesFieldName + ") ilike $" + (parameter++) + " or " + 
    "unnest(" + memberTablesConfig.Downloads.FilterCountriesFieldName + ") ilike $" + (parameter++) + " or " + 
    "unnest(" + memberTablesConfig.Downloads.FilterStatesFieldName + ") ilike $" + (parameter++) + " or " + 
    "unnest(" + memberTablesConfig.Downloads.FilterCitiesFieldName + ") ilike $" + (parameter++) + ")";
    var params = ['%' + search + '%', '%' + search + '%', '%' + search + '%', '%' + search + '%', '%' + search + '%', '%' + search + '%', '%' + search + '%'];

    return { "search": searchText, "parameter": parameter, "params": params };
  };
};

module.exports = Downloads;
