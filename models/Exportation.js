"use strict";

/**
 * Exportation model, which contains exportation related database manipulations.
 * @class Exportation
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberPath - 'path' module.
 * @property {object} memberPgFormat - 'pg-format' module.
 * @property {json} memberTablesConfig - Tables configuration.
 * @property {json} memberAttributesTableConfig - Attributes table configuration.
 * @property {object} memberDatabaseConfigurations - Database configurations.
 * @property {object} memberApplicationConfigurations - Application configurations.
 * @property {object} memberUtils - 'Utils' model.
 */
var Exportation = function() {

  // 'path' module
  var memberPath = require('path');
  // 'pg-format' module
  var memberPgFormat = require('pg-format');
  // Tables configuration
  var memberTablesConfig = require(memberPath.join(__dirname, '../configurations/Tables.json'));
  // Attributes table configuration
  var memberAttributesTableConfig = require(memberPath.join(__dirname, '../configurations/AttributesTable.json'));
  // Database configurations
  var memberDatabaseConfigurations = require(memberPath.join(__dirname, '../configurations/Database.json'));
  // Application configurations
  var memberApplicationConfigurations = require(memberPath.join(__dirname, '../configurations/Application.json'));
  // 'Utils' model
  var memberUtils = new (require('./Utils.js'))();

  /**
   * Callback of the database operations.
   * @callback Graphics~databaseOperationCallback
   * @param {error} err - Error
   * @param {json} result - Result of the operation
   */

   /**
    * Returns the PostgreSQL connection string.
    * @returns {string} connectionString - PostgreSQL connection string
    *
    * @function getPgConnectionString
    * @memberof Exportation
    * @inner
    */
   this.getPgConnectionString = function() {
     var connectionString = "PG:host=" + memberDatabaseConfigurations.Host + " port=" + memberDatabaseConfigurations.Port + " user=" + memberDatabaseConfigurations.User + " dbname=" + memberDatabaseConfigurations.Database;

     return connectionString;
   };

   /**
    * Returns the ogr2ogr application string.
    * @returns {string} ogr2ogr - ogr2ogr application
    *
    * @function ogr2ogr
    * @memberof Exportation
    * @inner
    */
   this.ogr2ogr = function() {
     var ogr2ogr = memberApplicationConfigurations.OGR2OGR;

     return ogr2ogr;
   };

  /**
   * Returns the fires data in GeoJSON format.
   * @param {object} pgPool - PostgreSQL connection pool
   * @param {string} dateTimeFrom - Initial date / time
   * @param {string} dateTimeTo - Final date / time
   * @param {json} options - Filtering options
   * @param {databaseOperationCallback} callback - Callback function
   * @returns {databaseOperationCallback} callback - Execution of the callback function, which will process the received data
   *
   * @function getGeoJSONData
   * @memberof Exportation
   * @inner
   */
  this.getGeoJSONData = function(pgPool, dateTimeFrom, dateTimeTo, options, callback) {
    // Counter of the query parameters
    var parameter = 1;

    // Setting of the query columns string
    var columns = "";
    for(var i = 0, columnsLength = memberAttributesTableConfig.Columns.length; i < columnsLength; i++) {
      if(memberAttributesTableConfig.Columns[i].Name !== "geom")
        columns += memberAttributesTableConfig.Columns[i].Name + ", ";
    }
    columns = columns.substring(0, (columns.length - 2));

    // Connection with the PostgreSQL database
    pgPool.connect(function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "select ST_AsGeoJSON(" + memberTablesConfig.Fires.GeometryFieldName + ")::json as geometry, row_to_json((select columns from (select " +
                    columns + ") as columns)) as properties from " + memberTablesConfig.Fires.Schema + "." +
                    memberTablesConfig.Fires.TableName + " where (" + memberTablesConfig.Fires.DateTimeFieldName +
                    " between $" + (parameter++) + " and $" + (parameter++) + ")",
            params = [dateTimeFrom, dateTimeTo];

        options.exportFilter = true;

        var getFiltersResult = memberUtils.getFilters(options, query, params, parameter);

        query = getFiltersResult.query;
        params = getFiltersResult.params;
        parameter = getFiltersResult.parameter;

        // If the 'options.limit' parameter exists, a limit clause is created
        if(options.limit !== undefined) {
          query += " limit " + options.limit;
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
   * Returns the query accordingly with the received parameters.
   * @param {boolean} selectGeometry - Flag that indicates if the geometry field should be selected
   * @param {string} dateTimeFrom - Initial date / time
   * @param {string} dateTimeTo - Final date / time
   * @param {json} options - Filtering options
   * @returns {string} finalQuery - Query
   *
   * @function getQuery
   * @memberof Exportation
   * @inner
   */
  this.getQuery = function(selectGeometry, dateTimeFrom, dateTimeTo, options) {
    // Setting of the query columns string
    var columns = "";

    for(var i = 0, columnsLength = memberAttributesTableConfig.Columns.length; i < columnsLength; i++) {
      if(memberAttributesTableConfig.Columns[i].Name !== memberTablesConfig.Fires.GeometryFieldName) {
        if(memberTablesConfig.Fires.DateTimeFieldName == memberAttributesTableConfig.Columns[i].Name)
          columns += "TO_CHAR(" + memberAttributesTableConfig.Columns[i].Name + ", 'YYYY/MM/DD HH24:MI:SS') as " + memberAttributesTableConfig.Columns[i].Name + ", ";
        else if(options.decimalSeparator !== undefined && options.decimalSeparator == "comma" && 
        (memberTablesConfig.Fires.LatitudeFieldName == memberAttributesTableConfig.Columns[i].Name || 
        memberTablesConfig.Fires.LongitudeFieldName == memberAttributesTableConfig.Columns[i].Name ||
        memberTablesConfig.Fires.PrecipitationFieldName == memberAttributesTableConfig.Columns[i].Name ||
        memberTablesConfig.Fires.RiskFieldName == memberAttributesTableConfig.Columns[i].Name ||
        memberTablesConfig.Fires.DaysWithoutRainFieldName == memberAttributesTableConfig.Columns[i].Name))
          columns += "replace(" + memberAttributesTableConfig.Columns[i].Name + "::text, '.', ',') as " + memberAttributesTableConfig.Columns[i].Name + ", ";
        else
          columns += memberAttributesTableConfig.Columns[i].Name + ", ";
      }
    }

    columns = columns.substring(0, (columns.length - 2));

    if(selectGeometry)
      columns += ", " + memberTablesConfig.Fires.GeometryFieldName;

    var encoding = (options.encoding.toLowerCase() == "windows" ? "LATIN1" : "UTF-8");

    // Creation of the query
    var query = "SET CLIENT_ENCODING TO '" + encoding + "'; select " + columns + " from " + memberTablesConfig.Fires.Schema + "." + memberTablesConfig.Fires.TableName + " where (" + memberTablesConfig.Fires.DateTimeFieldName + " between %L and %L)",
        params = [dateTimeFrom, dateTimeTo];

    options.exportFilter = true;
    options.pgFormatQuery = true;

    var getFiltersResult = memberUtils.getFilters(options, query, params);

    query = getFiltersResult.query;
    params = getFiltersResult.params;

    // If the 'options.limit' parameter exists, a limit clause is created
    if(options.limit !== undefined) {
      query += " limit " + options.limit;
    }

    params.splice(0, 0, query);

    var finalQuery = memberPgFormat.apply(null, params);

    return finalQuery + ";";
  };

  /**
   * Registers the downloads in the database.
   * @param {object} pgPool - PostgreSQL connection pool
   * @param {string} dateTimeFrom - Initial date / time
   * @param {string} dateTimeTo - Final date / time
   * @param {string} format - Exportation file format
   * @param {string} ip - Ip of the user
   * @param {json} options - Filtering options
   * @param {databaseOperationCallback} callback - Callback function
   * @returns {databaseOperationCallback} callback - Execution of the callback function, which will process the received data
   *
   * @function registerDownload
   * @memberof Exportation
   * @inner
   */
  this.registerDownload = function(pgPool, dateTimeFrom, dateTimeTo, format, ip, options, callback) {
    var date = new Date();

    var dateString = date.getFullYear().toString() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
    var timeString = ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2) + ':' + ('0' + date.getSeconds()).slice(-2);

    // Connection with the PostgreSQL database
    pgPool.connect(function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "insert into " + memberTablesConfig.Downloads.Schema + "." + memberTablesConfig.Downloads.TableName + " (" +
                    memberTablesConfig.Downloads.DateTimeFieldName + ", " + memberTablesConfig.Downloads.IpFieldName + ", " +
                    memberTablesConfig.Downloads.FilterBeginFieldName + ", " + memberTablesConfig.Downloads.FilterEndFieldName + ", " +
                    memberTablesConfig.Downloads.FilterSatellitesFieldName + ", " + memberTablesConfig.Downloads.FilterBiomesFieldName + ", " +
                    memberTablesConfig.Downloads.FilterCountriesFieldName + ", " + memberTablesConfig.Downloads.FilterStatesFieldName + ", " +
                    memberTablesConfig.Downloads.FilterCitiesFieldName + ", " + memberTablesConfig.Downloads.FilterFormatFieldName + ") values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);",
            params = [dateString + ' ' + timeString, ip, dateTimeFrom, dateTimeTo];

        if(options.satellites !== undefined)
          params.push(options.satellites.split(','));
        else
          params.push(null);

        if(options.biomes !== undefined)
          params.push(options.biomes.split(','));
        else
          params.push(null);

        if(options.countries !== undefined)
          params.push(options.countries.split(','));
        else
          params.push(null);

        if(options.states !== undefined)
          params.push(options.states.split(','));
        else
          params.push(null);

        if(options.cities !== undefined)
          params.push(options.cities.split(','));
        else
          params.push(null);

        params.push(format);

        // Execution of the query
        client.query(query, params, function(err, result) {
          done();
          if(!err) return callback(null, result);
          else return callback(err);
        });
      } else return callback(err);
    });
  };
};

module.exports = Exportation;
