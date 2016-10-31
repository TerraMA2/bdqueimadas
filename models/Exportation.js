"use strict";

/**
 * Exportation model, which contains exportation related database manipulations.
 * @class Exportation
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberPath - 'path' module.
 * @property {object} memberPgFormat - 'pg-format' module.
 * @property {object} memberPgConnectionPool - 'PgConnectionPool' module.
 * @property {json} memberTablesConfig - Tables configuration.
 * @property {json} memberAttributesTableConfig - Attributes table configuration.
 * @property {object} memberDatabaseConfigurations - Database configurations.
 * @property {object} memberApplicationConfigurations - Application configurations.
 */
var Exportation = function() {

  // 'path' module
  var memberPath = require('path');
  // 'pg-format' module
  var memberPgFormat = require('pg-format');
  // 'PgConnectionPool' module
  //var memberPgConnectionPool = new (require(memberPath.join(__dirname, '../modules/PgConnectionPool.js')))();
  // Tables configuration
  var memberTablesConfig = require(memberPath.join(__dirname, '../configurations/Tables.json'));
  // Attributes table configuration
  var memberAttributesTableConfig = require(memberPath.join(__dirname, '../configurations/AttributesTable.json'));
  // Database configurations
  var memberDatabaseConfigurations = require(memberPath.join(__dirname, '../configurations/Database.json'));
  // Application configurations
  var memberApplicationConfigurations = require(memberPath.join(__dirname, '../configurations/Application.json'));

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

        // If the 'options.satellites' parameter exists, a satellites 'where' clause is created
        if(options.satellites !== undefined) {
          var satellitesArray = options.satellites.split(',');
          query += " and " + memberTablesConfig.Fires.SatelliteFieldName + " in (";

          for(var i = 0, satellitesArrayLength = satellitesArray.length; i < satellitesArrayLength; i++) {
            query += "$" + (parameter++) + ",";
            params.push(satellitesArray[i]);
          }

          query = query.substring(0, (query.length - 1)) + ")";
        }

        // If the 'options.biomes' parameter exists, a biomes 'where' clause is created
        if(options.biomes !== undefined) {
          var biomesArray = options.biomes.split(',');
          query += " and " + memberTablesConfig.Fires.BiomeFieldName + " in (";

          for(var i = 0, biomesArrayLength = biomesArray.length; i < biomesArrayLength; i++) {
            query += "$" + (parameter++) + ",";
            params.push(biomesArray[i]);
          }

          query = query.substring(0, (query.length - 1)) + ")";
        }

        // If the 'options.countries' parameter exists, a countries 'where' clause is created
        if(options.countries !== undefined) {
          var countriesArray = options.countries.split(',');
          query += " and " + memberTablesConfig.Fires.CountryFieldName + " in (";

          for(var i = 0, countriesArrayLength = countriesArray.length; i < countriesArrayLength; i++) {
            query += "$" + (parameter++) + ",";
            params.push(countriesArray[i]);
          }

          query = query.substring(0, (query.length - 1)) + ")";
        }

        // If the 'options.states' parameter exists, a states 'where' clause is created
        if(options.states !== undefined) {
          var statesArray = options.states.split(',');
          query += " and " + memberTablesConfig.Fires.StateFieldName + " in (";

          for(var i = 0, statesArrayLength = statesArray.length; i < statesArrayLength; i++) {
            query += "$" + (parameter++) + ",";
            params.push(statesArray[i]);
          }

          query = query.substring(0, (query.length - 1)) + ")";
        }

        // If the 'options.cities' parameter exists, a cities 'where' clause is created
        if(options.cities !== undefined) {
          var citiesArray = options.cities.split(',');
          query += " and " + memberTablesConfig.Fires.CityFieldName + " in (";

          for(var i = 0, citiesArrayLength = citiesArray.length; i < citiesArrayLength; i++) {
            query += "$" + (parameter++) + ",";
            params.push(citiesArray[i]);
          }

          query = query.substring(0, (query.length - 1)) + ")";
        }

        // If the 'options.protectedArea' parameter exists, a protected area 'where' clause is created
        if(options.protectedArea !== undefined) {

          if(options.protectedArea.type === 'UCE') {
            var schemaAndTable = memberTablesConfig.UCE.Schema + "." + memberTablesConfig.UCE.TableName;
            var schemaAndTable5Km = memberTablesConfig.UCE.Schema + "." + memberTablesConfig.UCE.TableName5KM;
            var schemaAndTable10Km = memberTablesConfig.UCE.Schema + "." + memberTablesConfig.UCE.TableName10KM;
            var geom = memberTablesConfig.UCE.GeometryFieldName;
            var id = memberTablesConfig.UCE.IdFieldName;
          } else if(options.protectedArea.type === 'UCF') {
            var schemaAndTable = memberTablesConfig.UCF.Schema + "." + memberTablesConfig.UCF.TableName;
            var schemaAndTable5Km = memberTablesConfig.UCF.Schema + "." + memberTablesConfig.UCF.TableName5KM;
            var schemaAndTable10Km = memberTablesConfig.UCF.Schema + "." + memberTablesConfig.UCF.TableName10KM;
            var geom = memberTablesConfig.UCF.GeometryFieldName;
            var id = memberTablesConfig.UCF.IdFieldName;
          } else {
            var schemaAndTable = memberTablesConfig.TI.Schema + "." + memberTablesConfig.TI.TableName;
            var schemaAndTable5Km = memberTablesConfig.TI.Schema + "." + memberTablesConfig.TI.TableName5KM;
            var schemaAndTable10Km = memberTablesConfig.TI.Schema + "." + memberTablesConfig.TI.TableName10KM;
            var geom = memberTablesConfig.TI.GeometryFieldName;
            var id = memberTablesConfig.TI.IdFieldName;
          }

          if(!options.bufferInternal && options.bufferFive && options.bufferTen) {
            query += " and (ST_Intersects(" + memberTablesConfig.Fires.GeometryFieldName + ", (select " + geom + " from " + schemaAndTable10Km + " where " + id + " = $" + (parameter++) + "))" +
                     " and not ST_Intersects(" + memberTablesConfig.Fires.GeometryFieldName + ", (select " + geom + " from " + schemaAndTable + " where " + id + " = $" + (parameter++) + ")))";
            params.push(options.protectedArea.id, options.protectedArea.id);
          } else if(options.bufferInternal && !options.bufferFive && options.bufferTen) {
            query += " and (ST_Intersects(" + memberTablesConfig.Fires.GeometryFieldName + ", (select " + geom + " from " + schemaAndTable + " where " + id + " = $" + (parameter++) + "))" +
                     " or (ST_Intersects(" + memberTablesConfig.Fires.GeometryFieldName + ", (select " + geom + " from " + schemaAndTable10Km + " where " + id + " = $" + (parameter++) + "))" +
                     " and not ST_Intersects(" + memberTablesConfig.Fires.GeometryFieldName + ", (select " + geom + " from " + schemaAndTable5Km + " where " + id + " = $" + (parameter++) + "))))";
            params.push(options.protectedArea.id, options.protectedArea.id, options.protectedArea.id);
          } else if(options.bufferInternal && options.bufferFive && !options.bufferTen) {
            query += " and ST_Intersects(" + memberTablesConfig.Fires.GeometryFieldName + ", (select " + geom + " from " + schemaAndTable5Km + " where " + id + " = $" + (parameter++) + "))";
            params.push(options.protectedArea.id);
          } else if(!options.bufferInternal && !options.bufferFive && options.bufferTen) {
            query += " and (ST_Intersects(" + memberTablesConfig.Fires.GeometryFieldName + ", (select " + geom + " from " + schemaAndTable10Km + " where " + id + " = $" + (parameter++) + "))" +
                     " and not ST_Intersects(" + memberTablesConfig.Fires.GeometryFieldName + ", (select " + geom + " from " + schemaAndTable5Km + " where " + id + " = $" + (parameter++) + ")))";
            params.push(options.protectedArea.id, options.protectedArea.id);
          } else if(options.bufferInternal && !options.bufferFive && !options.bufferTen) {
            query += " and ST_Intersects(" + memberTablesConfig.Fires.GeometryFieldName + ", (select " + geom + " from " + schemaAndTable + " where " + id + " = $" + (parameter++) + "))";
            params.push(options.protectedArea.id);
          } else if(!options.bufferInternal && options.bufferFive && !options.bufferTen) {
            query += " and (ST_Intersects(" + memberTablesConfig.Fires.GeometryFieldName + ", (select " + geom + " from " + schemaAndTable5Km + " where " + id + " = $" + (parameter++) + "))" +
                     " and not ST_Intersects(" + memberTablesConfig.Fires.GeometryFieldName + ", (select " + geom + " from " + schemaAndTable + " where " + id + " = $" + (parameter++) + ")))";
            params.push(options.protectedArea.id, options.protectedArea.id);
          } else {
            query += " and ST_Intersects(" + memberTablesConfig.Fires.GeometryFieldName + ", (select " + geom + " from " + schemaAndTable10Km + " where " + id + " = $" + (parameter++) + "))";
            params.push(options.protectedArea.id);
          }
        }

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
          columns += "TO_CHAR(" + memberAttributesTableConfig.Columns[i].Name + ", 'YYYY/MM/DD HH:MM:SS') as " + memberAttributesTableConfig.Columns[i].Name + ", ";
        else
          columns += memberAttributesTableConfig.Columns[i].Name + ", ";
      }
    }

    columns = columns.substring(0, (columns.length - 2));

    if(selectGeometry)
      columns += ", " + memberTablesConfig.Fires.GeometryFieldName;

    // Creation of the query
    var query = "select " + columns + " from " + memberTablesConfig.Fires.Schema + "." + memberTablesConfig.Fires.TableName + " where (" + memberTablesConfig.Fires.DateTimeFieldName + " between %L and %L)",
        params = [dateTimeFrom, dateTimeTo];

    // If the 'options.satellites' parameter exists, a satellites 'where' clause is created
    if(options.satellites !== undefined) {
      var satellitesArray = options.satellites.split(',');
      query += " and " + memberTablesConfig.Fires.SatelliteFieldName + " in (";

      for(var i = 0, satellitesArrayLength = satellitesArray.length; i < satellitesArrayLength; i++) {
        query += "%L,";
        params.push(satellitesArray[i]);
      }

      query = query.substring(0, (query.length - 1)) + ")";
    }

    // If the 'options.biomes' parameter exists, a biomes 'where' clause is created
    if(options.biomes !== undefined) {
      var biomesArray = options.biomes.split(',');
      query += " and " + memberTablesConfig.Fires.BiomeFieldName + " in (";

      for(var i = 0, biomesArrayLength = biomesArray.length; i < biomesArrayLength; i++) {
        query += "%L,";
        params.push(biomesArray[i]);
      }

      query = query.substring(0, (query.length - 1)) + ")";
    }

    // If the 'options.countries' parameter exists, a countries 'where' clause is created
    if(options.countries !== undefined) {
      var countriesArray = options.countries.split(',');
      query += " and " + memberTablesConfig.Fires.CountryFieldName + " in (";

      for(var i = 0, countriesArrayLength = countriesArray.length; i < countriesArrayLength; i++) {
        query += "%L,";
        params.push(countriesArray[i]);
      }

      query = query.substring(0, (query.length - 1)) + ")";
    }

    // If the 'options.states' parameter exists, a states 'where' clause is created
    if(options.states !== undefined) {
      var statesArray = options.states.split(',');
      query += " and " + memberTablesConfig.Fires.StateFieldName + " in (";

      for(var i = 0, statesArrayLength = statesArray.length; i < statesArrayLength; i++) {
        query += "%L,";
        params.push(statesArray[i]);
      }

      query = query.substring(0, (query.length - 1)) + ")";
    }

    // If the 'options.cities' parameter exists, a cities 'where' clause is created
    if(options.cities !== undefined) {
      var citiesArray = options.cities.split(',');
      query += " and " + memberTablesConfig.Fires.CityFieldName + " in (";

      for(var i = 0, citiesArrayLength = citiesArray.length; i < citiesArrayLength; i++) {
        query += "%L,";
        params.push(citiesArray[i]);
      }

      query = query.substring(0, (query.length - 1)) + ")";
    }

    // If the 'options.protectedArea' parameter exists, a protected area 'where' clause is created
    if(options.protectedArea !== undefined) {

      if(options.protectedArea.type === 'UCE') {
        var schemaAndTable = memberTablesConfig.UCE.Schema + "." + memberTablesConfig.UCE.TableName;
        var schemaAndTable5Km = memberTablesConfig.UCE.Schema + "." + memberTablesConfig.UCE.TableName5KM;
        var schemaAndTable10Km = memberTablesConfig.UCE.Schema + "." + memberTablesConfig.UCE.TableName10KM;
        var geom = memberTablesConfig.UCE.GeometryFieldName;
        var id = memberTablesConfig.UCE.IdFieldName;
      } else if(options.protectedArea.type === 'UCF') {
        var schemaAndTable = memberTablesConfig.UCF.Schema + "." + memberTablesConfig.UCF.TableName;
        var schemaAndTable5Km = memberTablesConfig.UCF.Schema + "." + memberTablesConfig.UCF.TableName5KM;
        var schemaAndTable10Km = memberTablesConfig.UCF.Schema + "." + memberTablesConfig.UCF.TableName10KM;
        var geom = memberTablesConfig.UCF.GeometryFieldName;
        var id = memberTablesConfig.UCF.IdFieldName;
      } else {
        var schemaAndTable = memberTablesConfig.TI.Schema + "." + memberTablesConfig.TI.TableName;
        var schemaAndTable5Km = memberTablesConfig.TI.Schema + "." + memberTablesConfig.TI.TableName5KM;
        var schemaAndTable10Km = memberTablesConfig.TI.Schema + "." + memberTablesConfig.TI.TableName10KM;
        var geom = memberTablesConfig.TI.GeometryFieldName;
        var id = memberTablesConfig.TI.IdFieldName;
      }

      if(!options.bufferInternal && options.bufferFive && options.bufferTen) {
        query += " and (ST_Intersects(" + memberTablesConfig.Fires.GeometryFieldName + ", (select " + geom + " from " + schemaAndTable10Km + " where " + id + " = %L))" +
                 " and not ST_Intersects(" + memberTablesConfig.Fires.GeometryFieldName + ", (select " + geom + " from " + schemaAndTable + " where " + id + " = %L)))";
        params.push(options.protectedArea.id, options.protectedArea.id);
      } else if(options.bufferInternal && !options.bufferFive && options.bufferTen) {
        query += " and (ST_Intersects(" + memberTablesConfig.Fires.GeometryFieldName + ", (select " + geom + " from " + schemaAndTable + " where " + id + " = %L))" +
                 " or (ST_Intersects(" + memberTablesConfig.Fires.GeometryFieldName + ", (select " + geom + " from " + schemaAndTable10Km + " where " + id + " = %L))" +
                 " and not ST_Intersects(" + memberTablesConfig.Fires.GeometryFieldName + ", (select " + geom + " from " + schemaAndTable5Km + " where " + id + " = %L))))";
        params.push(options.protectedArea.id, options.protectedArea.id, options.protectedArea.id);
      } else if(options.bufferInternal && options.bufferFive && !options.bufferTen) {
        query += " and ST_Intersects(" + memberTablesConfig.Fires.GeometryFieldName + ", (select " + geom + " from " + schemaAndTable5Km + " where " + id + " = %L))";
        params.push(options.protectedArea.id);
      } else if(!options.bufferInternal && !options.bufferFive && options.bufferTen) {
        query += " and (ST_Intersects(" + memberTablesConfig.Fires.GeometryFieldName + ", (select " + geom + " from " + schemaAndTable10Km + " where " + id + " = %L))" +
                 " and not ST_Intersects(" + memberTablesConfig.Fires.GeometryFieldName + ", (select " + geom + " from " + schemaAndTable5Km + " where " + id + " = %L)))";
        params.push(options.protectedArea.id, options.protectedArea.id);
      } else if(options.bufferInternal && !options.bufferFive && !options.bufferTen) {
        query += " and ST_Intersects(" + memberTablesConfig.Fires.GeometryFieldName + ", (select " + geom + " from " + schemaAndTable + " where " + id + " = %L))";
        params.push(options.protectedArea.id);
      } else if(!options.bufferInternal && options.bufferFive && !options.bufferTen) {
        query += " and (ST_Intersects(" + memberTablesConfig.Fires.GeometryFieldName + ", (select " + geom + " from " + schemaAndTable5Km + " where " + id + " = %L))" +
                 " and not ST_Intersects(" + memberTablesConfig.Fires.GeometryFieldName + ", (select " + geom + " from " + schemaAndTable + " where " + id + " = %L)))";
        params.push(options.protectedArea.id, options.protectedArea.id);
      } else {
        query += " and ST_Intersects(" + memberTablesConfig.Fires.GeometryFieldName + ", (select " + geom + " from " + schemaAndTable10Km + " where " + id + " = %L))";
        params.push(options.protectedArea.id);
      }
    }

    // If the 'options.limit' parameter exists, a limit clause is created
    if(options.limit !== undefined) {
      query += " limit " + options.limit;
    }

    params.splice(0, 0, query);

    var finalQuery = memberPgFormat.apply(null, params);

    return finalQuery;
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
