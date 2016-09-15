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
  var memberPgConnectionPool = new (require(memberPath.join(__dirname, '../modules/PgConnectionPool.js')))();
  // Tables configuration
  var memberTablesConfig = require(memberPath.join(__dirname, '../configurations/Tables.json'));
  // Attributes table configuration
  var memberAttributesTableConfig = require(memberPath.join(__dirname, '../configurations/AttributesTable.json'));
  // Database configurations
  var memberDatabaseConfigurations = require(memberPath.join(__dirname, '../configurations/Database.json'));
  // Application configurations
  var memberApplicationConfigurations = require(memberPath.join(__dirname, '../configurations/Application.json'));

  var Cursor = require('pg-cursor');
  var json2csv = require('json2csv');
  var fs = require('fs');

  /**
   * Callback of the database operations.
   * @callback Graphics~databaseOperationCallback
   * @param {error} err - Error
   * @param {json} result - Result of the operation
   */

   // new

   this.getPgConnectionString = function() {
     var connectionString = "PG:host=" + memberDatabaseConfigurations.Host + " user=" + memberDatabaseConfigurations.User + " dbname=" + memberDatabaseConfigurations.Database;

     return connectionString;
   };

   this.ogr2ogr = function() {
     var ogr2ogr = memberApplicationConfigurations.OGR2OGR;

     return ogr2ogr;
   };

   // new

  /**
   * Returns the fires data in GeoJSON format.
   * @param {string} dateFrom - Initial date
   * @param {string} dateTo - Final date
   * @param {json} options - Filtering options
   * @param {databaseOperationCallback} callback - Callback function
   * @returns {databaseOperationCallback} callback - Execution of the callback function, which will process the received data
   *
   * @function getGeoJSONData
   * @memberof Exportation
   * @inner
   */
  this.getGeoJSONData = function(dateFrom, dateTo, options, callback) {
    // Counter of the query parameters
    var parameter = 1;

    // Setting of the query columns string
    var columns = "";
    for(var i = 0; i < memberAttributesTableConfig.Columns.length; i++) {
      if(memberAttributesTableConfig.Columns[i].Name !== "geom")
        columns += memberAttributesTableConfig.Columns[i].Name + ", ";
    }
    columns = columns.substring(0, (columns.length - 2));

    // Connection with the PostgreSQL database
    memberPgConnectionPool.getConnectionPool().connect(function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "select ST_AsGeoJSON(" + memberTablesConfig.Fires.GeometryFieldName + ")::json as geometry, row_to_json((select columns from (select " +
                    columns + ") as columns)) as properties from " + memberTablesConfig.Fires.Schema + "." +
                    memberTablesConfig.Fires.TableName + " where (" + memberTablesConfig.Fires.DateFieldName +
                    " between $" + (parameter++) + " and $" + (parameter++) + ")",
            params = [dateFrom, dateTo];

        // If the 'options.satellites' parameter exists, a satellites 'where' clause is created
        if(options.satellites !== undefined) {
          var satellitesArray = options.satellites.split(',');
          query += " and " + memberTablesConfig.Fires.SatelliteFieldName + " in (";

          for(var i = 0; i < satellitesArray.length; i++) {
            query += "$" + (parameter++) + ",";
            params.push(satellitesArray[i]);
          }

          query = query.substring(0, (query.length - 1)) + ")";
        }

        // If the 'options.biomes' parameter exists, a biomes 'where' clause is created
        if(options.biomes !== undefined) {
          var biomesArray = options.biomes.split(',');
          query += " and " + memberTablesConfig.Fires.BiomeFieldName + " in (";

          for(var i = 0; i < biomesArray.length; i++) {
            query += "$" + (parameter++) + ",";
            params.push(biomesArray[i]);
          }

          query = query.substring(0, (query.length - 1)) + ")";
        }

        // If the 'options.countries' parameter exists, a countries 'where' clause is created
        if(options.countries !== undefined) {
          var countriesArray = options.countries.split(',');
          query += " and " + memberTablesConfig.Fires.CountryFieldName + " in (";

          for(var i = 0; i < countriesArray.length; i++) {
            query += "$" + (parameter++) + ",";
            params.push(countriesArray[i]);
          }

          query = query.substring(0, (query.length - 1)) + ")";
        }

        // If the 'options.states' parameter exists, a states 'where' clause is created
        if(options.states !== undefined) {
          var statesArray = options.states.split(',');
          query += " and " + memberTablesConfig.Fires.StateFieldName + " in (";

          for(var i = 0; i < statesArray.length; i++) {
            query += "$" + (parameter++) + ",";
            params.push(statesArray[i]);
          }

          query = query.substring(0, (query.length - 1)) + ")";
        }

        // If the 'options.cities' parameter exists, a cities 'where' clause is created
        if(options.cities !== undefined) {
          var citiesArray = options.cities.split(',');
          query += " and " + memberTablesConfig.Fires.CityFieldName + " in (";

          for(var i = 0; i < citiesArray.length; i++) {
            query += "$" + (parameter++) + ",";
            params.push(citiesArray[i]);
          }

          query = query.substring(0, (query.length - 1)) + ")";
        }

        // If the 'options.protectedArea' parameter exists, a protected area 'where' clause is created
        if(options.protectedArea !== undefined) {

          if(options.protectedArea.type === 'UCE') {
            var schemaAndTable = memberTablesConfig.UCE.Schema + "." + memberTablesConfig.UCE.TableName;
            var geom = memberTablesConfig.UCE.GeometryFieldName;
            var id = memberTablesConfig.UCE.IdFieldName;
          } else if(options.protectedArea.type === 'UCF') {
            var schemaAndTable = memberTablesConfig.UCF.Schema + "." + memberTablesConfig.UCF.TableName;
            var geom = memberTablesConfig.UCF.GeometryFieldName;
            var id = memberTablesConfig.UCF.IdFieldName;
          } else {
            var schemaAndTable = memberTablesConfig.TI.Schema + "." + memberTablesConfig.TI.TableName;
            var geom = memberTablesConfig.TI.GeometryFieldName;
            var id = memberTablesConfig.TI.IdFieldName;
          }

          query += " and ST_Intersects(" + memberTablesConfig.Fires.GeometryFieldName + ", (select " + geom + " from " + schemaAndTable + " where " + id + " = $" + (parameter++) + "))";
          params.push(options.protectedArea.id);
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

  // new

  this.getQuery = function(selectGeometry, dateFrom, dateTo, options) {
    // %% outputs a literal % character.
    // %I outputs an escaped SQL identifier.
    // %L outputs an escaped SQL literal.
    // %|s outputs a simple string.

    // Setting of the query columns string
    var columns = "";

    for(var i = 0; i < memberAttributesTableConfig.Columns.length; i++) {
      if(memberAttributesTableConfig.Columns[i].Name !== memberTablesConfig.Fires.GeometryFieldName) {
        if(memberTablesConfig.Fires.DateFieldName == memberAttributesTableConfig.Columns[i].Name)
          columns += "TO_CHAR(" + memberAttributesTableConfig.Columns[i].Name + ", 'YYYY/MM/DD') as " + memberAttributesTableConfig.Columns[i].Name + ", ";
        else
          columns += memberAttributesTableConfig.Columns[i].Name + ", ";
      }
    }

    columns = columns.substring(0, (columns.length - 2));

    if(selectGeometry)
      columns += ", " + memberTablesConfig.Fires.GeometryFieldName;

    // Creation of the query
    var query = "select " + columns + " from " + memberTablesConfig.Fires.Schema + "." + memberTablesConfig.Fires.TableName + " where (" + memberTablesConfig.Fires.DateFieldName +
                " between %L and %L)",
        params = [dateFrom, dateTo];

    // If the 'options.satellites' parameter exists, a satellites 'where' clause is created
    if(options.satellites !== undefined) {
      var satellitesArray = options.satellites.split(',');
      query += " and " + memberTablesConfig.Fires.SatelliteFieldName + " in (";

      for(var i = 0; i < satellitesArray.length; i++) {
        query += "%L,";
        params.push(satellitesArray[i]);
      }

      query = query.substring(0, (query.length - 1)) + ")";
    }

    // If the 'options.biomes' parameter exists, a biomes 'where' clause is created
    if(options.biomes !== undefined) {
      var biomesArray = options.biomes.split(',');
      query += " and " + memberTablesConfig.Fires.BiomeFieldName + " in (";

      for(var i = 0; i < biomesArray.length; i++) {
        query += "%L,";
        params.push(biomesArray[i]);
      }

      query = query.substring(0, (query.length - 1)) + ")";
    }

    // If the 'options.countries' parameter exists, a countries 'where' clause is created
    if(options.countries !== undefined) {
      var countriesArray = options.countries.split(',');
      query += " and " + memberTablesConfig.Fires.CountryFieldName + " in (";

      for(var i = 0; i < countriesArray.length; i++) {
        query += "%L,";
        params.push(countriesArray[i]);
      }

      query = query.substring(0, (query.length - 1)) + ")";
    }

    // If the 'options.states' parameter exists, a states 'where' clause is created
    if(options.states !== undefined) {
      var statesArray = options.states.split(',');
      query += " and " + memberTablesConfig.Fires.StateFieldName + " in (";

      for(var i = 0; i < statesArray.length; i++) {
        query += "%L,";
        params.push(statesArray[i]);
      }

      query = query.substring(0, (query.length - 1)) + ")";
    }

    // If the 'options.cities' parameter exists, a cities 'where' clause is created
    if(options.cities !== undefined) {
      var citiesArray = options.cities.split(',');
      query += " and " + memberTablesConfig.Fires.CityFieldName + " in (";

      for(var i = 0; i < citiesArray.length; i++) {
        query += "%L,";
        params.push(citiesArray[i]);
      }

      query = query.substring(0, (query.length - 1)) + ")";
    }

    // If the 'options.protectedArea' parameter exists, a protected area 'where' clause is created
    if(options.protectedArea !== undefined) {

      if(options.protectedArea.type === 'UCE') {
        var schemaAndTable = memberTablesConfig.UCE.Schema + "." + memberTablesConfig.UCE.TableName;
        var geom = memberTablesConfig.UCE.GeometryFieldName;
        var id = memberTablesConfig.UCE.IdFieldName;
      } else if(options.protectedArea.type === 'UCF') {
        var schemaAndTable = memberTablesConfig.UCF.Schema + "." + memberTablesConfig.UCF.TableName;
        var geom = memberTablesConfig.UCF.GeometryFieldName;
        var id = memberTablesConfig.UCF.IdFieldName;
      } else {
        var schemaAndTable = memberTablesConfig.TI.Schema + "." + memberTablesConfig.TI.TableName;
        var geom = memberTablesConfig.TI.GeometryFieldName;
        var id = memberTablesConfig.TI.IdFieldName;
      }

      query += " and ST_Intersects(" + memberTablesConfig.Fires.GeometryFieldName + ", (select " + geom + " from " + schemaAndTable + " where " + id + " = %L))";
      params.push(options.protectedArea.id);
    }

    // If the 'options.limit' parameter exists, a limit clause is created
    if(options.limit !== undefined) {
      query += " limit " + options.limit;
    }

    params.splice(0, 0, query);

    var finalQuery = memberPgFormat.apply(null, params);

    return finalQuery;
  };

  this.getCSVData = function(dateFrom, dateTo, options) {

    // Counter of the query parameters
    var parameter = 1;

    // Setting of the query columns string
    var columns = "";
    var fields = [];

    for(var i = 0; i < memberAttributesTableConfig.Columns.length; i++) {
      if(memberAttributesTableConfig.Columns[i].Name !== "geom") {
        if(memberTablesConfig.Fires.DateFieldName == memberAttributesTableConfig.Columns[i].Name) {
          columns += "TO_CHAR(" + memberAttributesTableConfig.Columns[i].Name + ", 'YYYY/MM/DD') as " + memberAttributesTableConfig.Columns[i].Name + ", ";
        } else {
          columns += memberAttributesTableConfig.Columns[i].Name + ", ";
        }

        fields.push(memberAttributesTableConfig.Columns[i].Name);
      }
    }
    columns = columns.substring(0, (columns.length - 2));

    // Connection with the PostgreSQL database
    memberPgConnectionPool.getConnectionPool().connect(function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "select " + columns + " from " + memberTablesConfig.Fires.Schema + "." + memberTablesConfig.Fires.TableName + " where (" + memberTablesConfig.Fires.DateFieldName +
                    " between $" + (parameter++) + " and $" + (parameter++) + ")",
            params = [dateFrom, dateTo];

        // If the 'options.satellites' parameter exists, a satellites 'where' clause is created
        if(options.satellites !== undefined) {
          var satellitesArray = options.satellites.split(',');
          query += " and " + memberTablesConfig.Fires.SatelliteFieldName + " in (";

          for(var i = 0; i < satellitesArray.length; i++) {
            query += "$" + (parameter++) + ",";
            params.push(satellitesArray[i]);
          }

          query = query.substring(0, (query.length - 1)) + ")";
        }

        // If the 'options.biomes' parameter exists, a biomes 'where' clause is created
        if(options.biomes !== undefined) {
          var biomesArray = options.biomes.split(',');
          query += " and " + memberTablesConfig.Fires.BiomeFieldName + " in (";

          for(var i = 0; i < biomesArray.length; i++) {
            query += "$" + (parameter++) + ",";
            params.push(biomesArray[i]);
          }

          query = query.substring(0, (query.length - 1)) + ")";
        }

        // If the 'options.countries' parameter exists, a countries 'where' clause is created
        if(options.countries !== undefined) {
          var countriesArray = options.countries.split(',');
          query += " and " + memberTablesConfig.Fires.CountryFieldName + " in (";

          for(var i = 0; i < countriesArray.length; i++) {
            query += "$" + (parameter++) + ",";
            params.push(countriesArray[i]);
          }

          query = query.substring(0, (query.length - 1)) + ")";
        }

        // If the 'options.states' parameter exists, a states 'where' clause is created
        if(options.states !== undefined) {
          var statesArray = options.states.split(',');
          query += " and " + memberTablesConfig.Fires.StateFieldName + " in (";

          for(var i = 0; i < statesArray.length; i++) {
            query += "$" + (parameter++) + ",";
            params.push(statesArray[i]);
          }

          query = query.substring(0, (query.length - 1)) + ")";
        }

        // If the 'options.cities' parameter exists, a cities 'where' clause is created
        if(options.cities !== undefined) {
          var citiesArray = options.cities.split(',');
          query += " and " + memberTablesConfig.Fires.CityFieldName + " in (";

          for(var i = 0; i < citiesArray.length; i++) {
            query += "$" + (parameter++) + ",";
            params.push(citiesArray[i]);
          }

          query = query.substring(0, (query.length - 1)) + ")";
        }

        // If the 'options.protectedArea' parameter exists, a protected area 'where' clause is created
        if(options.protectedArea !== undefined) {

          if(options.protectedArea.type === 'UCE') {
            var schemaAndTable = memberTablesConfig.UCE.Schema + "." + memberTablesConfig.UCE.TableName;
            var geom = memberTablesConfig.UCE.GeometryFieldName;
            var id = memberTablesConfig.UCE.IdFieldName;
          } else if(options.protectedArea.type === 'UCF') {
            var schemaAndTable = memberTablesConfig.UCF.Schema + "." + memberTablesConfig.UCF.TableName;
            var geom = memberTablesConfig.UCF.GeometryFieldName;
            var id = memberTablesConfig.UCF.IdFieldName;
          } else {
            var schemaAndTable = memberTablesConfig.TI.Schema + "." + memberTablesConfig.TI.TableName;
            var geom = memberTablesConfig.TI.GeometryFieldName;
            var id = memberTablesConfig.TI.IdFieldName;
          }

          query += " and ST_Intersects(" + memberTablesConfig.Fires.GeometryFieldName + ", (select " + geom + " from " + schemaAndTable + " where " + id + " = $" + (parameter++) + "))";
          params.push(options.protectedArea.id);
        }

        // If the 'options.limit' parameter exists, a limit clause is created
        if(options.limit !== undefined) {
          query += " limit " + options.limit;
        }

        // Execution of the query
        /*client.query(query, params, function(err, result) {
          done();
          if(!err) return callback(null, result);
          else return callback(err);
        });*/

        var cursor = client.query(new Cursor(query, params));

        console.log(query);
        console.log(params);

        cursor.read(5000, function(err, rows) {
          if(!err) {
            if(rows.length == 0) {
              console.log('cabou');
              done();
            } else {
              try {
                var result = json2csv({ data: rows, fields: fields });

                fs.writeFile('C:\\Users\\jsouza\\Desktop\\file.csv', result, function(err) {
                  if (err) throw err;
                  console.log('file saved');
                });
              } catch (err) {
                console.error(err);
              }
            }
          } else {
            done(err);
          }
        });

      } else console.error(err);
    });
  };

  // new

  /**
   * Registers the downloads in the database.
   * @param {string} dateFrom - Initial date
   * @param {string} dateTo - Final date
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
  this.registerDownload = function(dateFrom, dateTo, format, ip, options, callback) {
    var date = new Date();

    var dateString = date.getFullYear().toString() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
    var timeString = ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2) + ':' + ('0' + date.getSeconds()).slice(-2);

    // Connection with the PostgreSQL database
    memberPgConnectionPool.getConnectionPool().connect(function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "insert into " + memberTablesConfig.Downloads.Schema + "." + memberTablesConfig.Downloads.TableName + " (" +
                    memberTablesConfig.Downloads.DateFieldName + ", " + memberTablesConfig.Downloads.TimeFieldName + ", " +
                    memberTablesConfig.Downloads.IpFieldName + ", " + memberTablesConfig.Downloads.FilterBeginFieldName + ", " +
                    memberTablesConfig.Downloads.FilterEndFieldName + ", " + memberTablesConfig.Downloads.FilterSatellitesFieldName + ", " +
                    memberTablesConfig.Downloads.FilterBiomesFieldName + ", " + memberTablesConfig.Downloads.FilterCountriesFieldName + ", " +
                    memberTablesConfig.Downloads.FilterStatesFieldName + ", " + memberTablesConfig.Downloads.FilterCitiesFieldName + ", " +
                    memberTablesConfig.Downloads.FilterFormatFieldName + ") values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);",
            params = [dateString, timeString, ip, dateFrom, dateTo];

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
