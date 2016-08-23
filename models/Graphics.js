"use strict";

/**
 * Graphics model, which contains graphics related database manipulations.
 * @class Graphics
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberPath - 'path' module.
 * @property {object} memberPgConnectionPool - 'PgConnectionPool' module.
 * @property {json} memberTablesConfig - Tables configuration.
 */
var Graphics = function() {

  // 'path' module
  var memberPath = require('path');
  // 'PgConnectionPool' module
  var memberPgConnectionPool = new (require(memberPath.join(__dirname, '../modules/PgConnectionPool.js')))();
  // Tables configuration
  var memberTablesConfig = require(memberPath.join(__dirname, '../configurations/Tables.json'));

  /**
   * Callback of the database operations.
   * @callback Graphics~databaseOperationCallback
   * @param {error} err - Error
   * @param {json} result - Result of the operation
   */

  /**
   * Returns the count of the fires grouped by the received key.
   * @param {string} dateFrom - Initial date
   * @param {string} dateTo - Final date
   * @param {string} key - Key
   * @param {json} filterRules - Filter rules
   * @param {json} options - Filtering options
   * @param {databaseOperationCallback} callback - Callback function
   * @returns {databaseOperationCallback} callback - Execution of the callback function, which will process the received data
   *
   * @function getFiresCount
   * @memberof Graphics
   * @inner
   */
  this.getFiresCount = function(dateFrom, dateTo, key, filterRules, options, callback) {
    // Counter of the query parameters
    var parameter = 1;

    // Connection with the PostgreSQL database
    memberPgConnectionPool.getConnectionPool().connect(function(err, client, done) {
      if(!err) {

        var fields = key + ", count(*) as count";
        var group = key;

        if(options.y !== undefined) {
          var yFields = options.y.match(/[^{\}]+(?=})/g);
          var index = yFields.indexOf(key);
          if(index > -1) yFields.splice(index, 1);

          if(yFields.length > 0) {
            fields += ", " + yFields.toString();
            group += ", " + yFields.toString();
          }
        }

        // Creation of the query
        var query = "select " + fields + " from " +
        memberTablesConfig.Fires.Schema + "." + memberTablesConfig.Fires.TableName +
        " where (" + memberTablesConfig.Fires.DateFieldName + " between $" + (parameter++) + " and $" + (parameter++) + ")",
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
        if(options.countries !== undefined && !filterRules.ignoreCountryFilter) {
          var countriesArray = options.countries.split(',');
          query += " and " + memberTablesConfig.Fires.CountryFieldName + " in (";

          for(var i = 0; i < countriesArray.length; i++) {
            query += "$" + (parameter++) + ",";
            params.push(countriesArray[i]);
          }

          query = query.substring(0, (query.length - 1)) + ")";
        }

        // If the 'options.states' parameter exists, a states 'where' clause is created
        if(options.states !== undefined && !filterRules.ignoreStateFilter) {
          var statesArray = options.states.split(',');
          query += " and " + memberTablesConfig.Fires.StateFieldName + " in (";

          for(var i = 0; i < statesArray.length; i++) {
            query += "$" + (parameter++) + ",";
            params.push(statesArray[i]);
          }

          query = query.substring(0, (query.length - 1)) + ")";
        }

        // If the 'options.cities' parameter exists, a cities 'where' clause is created
        if(options.cities !== undefined && !filterRules.ignoreCityFilter) {
          var citiesArray = options.cities.split(',');
          query += " and " + memberTablesConfig.Fires.CityFieldName + " in (";

          for(var i = 0; i < citiesArray.length; i++) {
            query += "$" + (parameter++) + ",";
            params.push(citiesArray[i]);
          }

          query = query.substring(0, (query.length - 1)) + ")";
        }

        query += " group by " + group + " order by count desc, " + key + " asc";

        // If the 'options.limit' parameter exists, a limit clause is created
        if(options.limit !== undefined) {
          query += " limit $" + (parameter++);
          params.push(options.limit);
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
   * Returns the count of the fires grouped by protected areas.
   * @param {string} dateFrom - Initial date
   * @param {string} dateTo - Final date
   * @param {string} key - Key
   * @param {json} filterRules - Filter rules
   * @param {json} options - Filtering options
   * @param {databaseOperationCallback} callback - Callback function
   * @returns {databaseOperationCallback} callback - Execution of the callback function, which will process the received data
   *
   * @function getFiresCountByPA
   * @memberof Graphics
   * @inner
   */
  this.getFiresCountByPA = function(dateFrom, dateTo, key, filterRules, options, callback) {
    // Counter of the query parameters
    var parameter = 1;

    // Connection with the PostgreSQL database
    memberPgConnectionPool.getConnectionPool().connect(function(err, client, done) {
      if(!err) {
        if(key === "UCE") {
          var fields = "a." + memberTablesConfig.UCE.NameFieldName + " as name, count(b.*) as count";
          var nameField = "a." + memberTablesConfig.UCE.NameFieldName;
          var geomField = "a." + memberTablesConfig.UCE.GeometryFieldName;
          var group = "a." + memberTablesConfig.UCE.NameFieldName;
          var table = memberTablesConfig.UCE.Schema + "." + memberTablesConfig.UCE.TableName + " a";
        } else if(key === "UCF") {
          var fields = "a." + memberTablesConfig.UCF.NameFieldName + " as name, count(b.*) as count";
          var nameField = "a." + memberTablesConfig.UCF.NameFieldName;
          var geomField = "a." + memberTablesConfig.UCF.GeometryFieldName;
          var group = "a." + memberTablesConfig.UCF.NameFieldName;
          var table = memberTablesConfig.UCF.Schema + "." + memberTablesConfig.UCF.TableName + " a";
        } else {
          var fields = "a." + memberTablesConfig.TI.NameFieldName + " as name, count(b.*) as count";
          var nameField = "a." + memberTablesConfig.TI.NameFieldName;
          var geomField = "a." + memberTablesConfig.TI.GeometryFieldName;
          var group = "a." + memberTablesConfig.TI.NameFieldName;
          var table = memberTablesConfig.TI.Schema + "." + memberTablesConfig.TI.TableName + " a";
        }

        // Creation of the query
        var query = "select " + fields + " from " + table +
        " inner join " + memberTablesConfig.Fires.Schema + "." + memberTablesConfig.Fires.TableName +
        " b on ST_Intersects(b." + memberTablesConfig.Fires.GeometryFieldName + ", " + geomField + ")" +
        " where ST_IsValid(" + geomField + ") and (b." + memberTablesConfig.Fires.DateFieldName + " between $" + (parameter++) + " and $" + (parameter++) + ")",
            params = [dateFrom, dateTo];

        // If the 'options.satellites' parameter exists, a satellites 'where' clause is created
        if(options.satellites !== undefined) {
          var satellitesArray = options.satellites.split(',');
          query += " and b." + memberTablesConfig.Fires.SatelliteFieldName + " in (";

          for(var i = 0; i < satellitesArray.length; i++) {
            query += "$" + (parameter++) + ",";
            params.push(satellitesArray[i]);
          }

          query = query.substring(0, (query.length - 1)) + ")";
        }

        // If the 'options.biomes' parameter exists, a biomes 'where' clause is created
        if(options.biomes !== undefined) {
          var biomesArray = options.biomes.split(',');
          query += " and b." + memberTablesConfig.Fires.BiomeFieldName + " in (";

          for(var i = 0; i < biomesArray.length; i++) {
            query += "$" + (parameter++) + ",";
            params.push(biomesArray[i]);
          }

          query = query.substring(0, (query.length - 1)) + ")";
        }

        // If the 'options.countries' parameter exists, a countries 'where' clause is created
        if(options.countries !== undefined && !filterRules.ignoreCountryFilter) {
          var countriesArray = options.countries.split(',');
          query += " and b." + memberTablesConfig.Fires.CountryFieldName + " in (";

          for(var i = 0; i < countriesArray.length; i++) {
            query += "$" + (parameter++) + ",";
            params.push(countriesArray[i]);
          }

          query = query.substring(0, (query.length - 1)) + ")";
        }

        // If the 'options.states' parameter exists, a states 'where' clause is created
        if(options.states !== undefined && !filterRules.ignoreStateFilter) {
          var statesArray = options.states.split(',');
          query += " and b." + memberTablesConfig.Fires.StateFieldName + " in (";

          for(var i = 0; i < statesArray.length; i++) {
            query += "$" + (parameter++) + ",";
            params.push(statesArray[i]);
          }

          query = query.substring(0, (query.length - 1)) + ")";
        }

        // If the 'options.cities' parameter exists, a cities 'where' clause is created
        if(options.cities !== undefined && !filterRules.ignoreCityFilter) {
          var citiesArray = options.cities.split(',');
          query += " and b." + memberTablesConfig.Fires.CityFieldName + " in (";

          for(var i = 0; i < citiesArray.length; i++) {
            query += "$" + (parameter++) + ",";
            params.push(citiesArray[i]);
          }

          query = query.substring(0, (query.length - 1)) + ")";
        }

        query += " group by " + group + " order by count desc, " + nameField + " asc";

        // If the 'options.limit' parameter exists, a limit clause is created
        if(options.limit !== undefined) {
          query += " limit $" + (parameter++);
          params.push(options.limit);
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
   * Returns the count of the fires grouped by the buffer of the protected areas.
   * @param {string} dateFrom - Initial date
   * @param {string} dateTo - Final date
   * @param {string} key - Key
   * @param {json} filterRules - Filter rules
   * @param {json} options - Filtering options
   * @param {databaseOperationCallback} callback - Callback function
   * @returns {databaseOperationCallback} callback - Execution of the callback function, which will process the received data
   *
   * @function getFiresCountByPABuffer
   * @memberof Graphics
   * @inner
   */
  this.getFiresCountByPABuffer = function(dateFrom, dateTo, key, filterRules, options, callback) {
    // Counter of the query parameters
    var parameter = 1;

    // Connection with the PostgreSQL database
    memberPgConnectionPool.getConnectionPool().connect(function(err, client, done) {
      if(!err) {
        if(key === "UCE_5KM") {
          var fields = "'Buffer de 5 Km - ' || a." + memberTablesConfig.UCE.NameFieldName + " as name, count(c.*) as count";
          var nameField = "a." + memberTablesConfig.UCE.NameFieldName;
          var geomFieldPA = "a." + memberTablesConfig.UCE.GeometryFieldName;
          var geomFieldBuffer = "b." + memberTablesConfig.UCE.Buffer5KMGeometryFieldName;
          var group = "a." + memberTablesConfig.UCE.NameFieldName;
          var idPA = "a." + memberTablesConfig.UCE.IdFieldName;
          var idBuffer = "b." + memberTablesConfig.UCE.Buffer5KMIdFieldName;
          var tablePA = memberTablesConfig.UCE.Schema + "." + memberTablesConfig.UCE.TableName + " a";
          var tableBuffer = memberTablesConfig.UCE.Buffer5KMSchema + "." + memberTablesConfig.UCE.Buffer5KMTableName + " b";
        } else if(key === "UCF_5KM") {
          var fields = "'Buffer de 5 Km - ' || a." + memberTablesConfig.UCF.NameFieldName + " as name, count(c.*) as count";
          var nameField = "a." + memberTablesConfig.UCF.NameFieldName;
          var geomFieldPA = "a." + memberTablesConfig.UCF.GeometryFieldName;
          var geomFieldBuffer = "b." + memberTablesConfig.UCF.Buffer5KMGeometryFieldName;
          var group = "a." + memberTablesConfig.UCF.NameFieldName;
          var idPA = "a." + memberTablesConfig.UCF.IdFieldName;
          var idBuffer = "b." + memberTablesConfig.UCF.Buffer5KMIdFieldName;
          var tablePA = memberTablesConfig.UCF.Schema + "." + memberTablesConfig.UCF.TableName + " a";
          var tableBuffer = memberTablesConfig.UCF.Buffer5KMSchema + "." + memberTablesConfig.UCF.Buffer5KMTableName + " b";
        } else if(key === "TI_5KM") {
          var fields = "'Buffer de 5 Km - ' || a." + memberTablesConfig.TI.NameFieldName + " as name, count(c.*) as count";
          var nameField = "a." + memberTablesConfig.TI.NameFieldName;
          var geomFieldPA = "a." + memberTablesConfig.TI.GeometryFieldName;
          var geomFieldBuffer = "b." + memberTablesConfig.TI.Buffer5KMGeometryFieldName;
          var group = "a." + memberTablesConfig.TI.NameFieldName;
          var idPA = "a." + memberTablesConfig.TI.IdFieldName;
          var idBuffer = "b." + memberTablesConfig.TI.Buffer5KMIdFieldName;
          var tablePA = memberTablesConfig.TI.Schema + "." + memberTablesConfig.TI.TableName + " a";
          var tableBuffer = memberTablesConfig.TI.Buffer5KMSchema + "." + memberTablesConfig.TI.Buffer5KMTableName + " b";
        } else if(key === "UCE_10KM") {
          var fields = "'Buffer de 10 Km - ' || a." + memberTablesConfig.UCE.NameFieldName + " as name, count(c.*) as count";
          var nameField = "a." + memberTablesConfig.UCE.NameFieldName;
          var geomFieldPA = "a." + memberTablesConfig.UCE.GeometryFieldName;
          var geomFieldBuffer = "b." + memberTablesConfig.UCE.Buffer10KMGeometryFieldName;
          var group = "a." + memberTablesConfig.UCE.NameFieldName;
          var idPA = "a." + memberTablesConfig.UCE.IdFieldName;
          var idBuffer = "b." + memberTablesConfig.UCE.Buffer10KMIdFieldName;
          var tablePA = memberTablesConfig.UCE.Schema + "." + memberTablesConfig.UCE.TableName + " a";
          var tableBuffer = memberTablesConfig.UCE.Buffer10KMSchema + "." + memberTablesConfig.UCE.Buffer10KMTableName + " b";
        } else if(key === "UCF_10KM") {
          var fields = "'Buffer de 10 Km - ' || a." + memberTablesConfig.UCF.NameFieldName + " as name, count(c.*) as count";
          var nameField = "a." + memberTablesConfig.UCF.NameFieldName;
          var geomFieldPA = "a." + memberTablesConfig.UCF.GeometryFieldName;
          var geomFieldBuffer = "b." + memberTablesConfig.UCF.Buffer10KMGeometryFieldName;
          var group = "a." + memberTablesConfig.UCF.NameFieldName;
          var idPA = "a." + memberTablesConfig.UCF.IdFieldName;
          var idBuffer = "b." + memberTablesConfig.UCF.Buffer10KMIdFieldName;
          var tablePA = memberTablesConfig.UCF.Schema + "." + memberTablesConfig.UCF.TableName + " a";
          var tableBuffer = memberTablesConfig.UCF.Buffer10KMSchema + "." + memberTablesConfig.UCF.Buffer10KMTableName + " b";
        } else {
          var fields = "'Buffer de 10 Km - ' || a." + memberTablesConfig.TI.NameFieldName + " as name, count(c.*) as count";
          var nameField = "a." + memberTablesConfig.TI.NameFieldName;
          var geomFieldPA = "a." + memberTablesConfig.TI.GeometryFieldName;
          var geomFieldBuffer = "b." + memberTablesConfig.TI.Buffer10KMGeometryFieldName;
          var group = "a." + memberTablesConfig.TI.NameFieldName;
          var idPA = "a." + memberTablesConfig.TI.IdFieldName;
          var idBuffer = "b." + memberTablesConfig.TI.Buffer10KMIdFieldName;
          var tablePA = memberTablesConfig.TI.Schema + "." + memberTablesConfig.TI.TableName + " a";
          var tableBuffer = memberTablesConfig.TI.Buffer10KMSchema + "." + memberTablesConfig.TI.Buffer10KMTableName + " b";
        }

        // Creation of the query
        var query = "select " + fields + " from " + tablePA +
        " inner join " + tableBuffer + " on (" + idPA + " = " + idBuffer + ")" +
        " inner join " + memberTablesConfig.Fires.Schema + "." + memberTablesConfig.Fires.TableName +
        " c on (ST_Intersects(c." + memberTablesConfig.Fires.GeometryFieldName + ", " + geomFieldBuffer +
        ") and ST_Disjoint(c." + memberTablesConfig.Fires.GeometryFieldName + ", " + geomFieldPA + "))" +
        " where ST_IsValid(" + geomFieldPA + ") and ST_IsValid(" + geomFieldBuffer + ") and (c." + memberTablesConfig.Fires.DateFieldName +
        " between $" + (parameter++) + " and $" + (parameter++) + ")",
            params = [dateFrom, dateTo];

        // If the 'options.satellites' parameter exists, a satellites 'where' clause is created
        if(options.satellites !== undefined) {
          var satellitesArray = options.satellites.split(',');
          query += " and c." + memberTablesConfig.Fires.SatelliteFieldName + " in (";

          for(var i = 0; i < satellitesArray.length; i++) {
            query += "$" + (parameter++) + ",";
            params.push(satellitesArray[i]);
          }

          query = query.substring(0, (query.length - 1)) + ")";
        }

        // If the 'options.biomes' parameter exists, a biomes 'where' clause is created
        if(options.biomes !== undefined) {
          var biomesArray = options.biomes.split(',');
          query += " and c." + memberTablesConfig.Fires.BiomeFieldName + " in (";

          for(var i = 0; i < biomesArray.length; i++) {
            query += "$" + (parameter++) + ",";
            params.push(biomesArray[i]);
          }

          query = query.substring(0, (query.length - 1)) + ")";
        }

        // If the 'options.countries' parameter exists, a countries 'where' clause is created
        if(options.countries !== undefined && !filterRules.ignoreCountryFilter) {
          var countriesArray = options.countries.split(',');
          query += " and c." + memberTablesConfig.Fires.CountryFieldName + " in (";

          for(var i = 0; i < countriesArray.length; i++) {
            query += "$" + (parameter++) + ",";
            params.push(countriesArray[i]);
          }

          query = query.substring(0, (query.length - 1)) + ")";
        }

        // If the 'options.states' parameter exists, a states 'where' clause is created
        if(options.states !== undefined && !filterRules.ignoreStateFilter) {
          var statesArray = options.states.split(',');
          query += " and c." + memberTablesConfig.Fires.StateFieldName + " in (";

          for(var i = 0; i < statesArray.length; i++) {
            query += "$" + (parameter++) + ",";
            params.push(statesArray[i]);
          }

          query = query.substring(0, (query.length - 1)) + ")";
        }

        // If the 'options.cities' parameter exists, a cities 'where' clause is created
        if(options.cities !== undefined && !filterRules.ignoreCityFilter) {
          var citiesArray = options.cities.split(',');
          query += " and c." + memberTablesConfig.Fires.CityFieldName + " in (";

          for(var i = 0; i < citiesArray.length; i++) {
            query += "$" + (parameter++) + ",";
            params.push(citiesArray[i]);
          }

          query = query.substring(0, (query.length - 1)) + ")";
        }

        query += " group by " + group + " order by count desc, " + nameField + " asc";

        // If the 'options.limit' parameter exists, a limit clause is created
        if(options.limit !== undefined) {
          query += " limit $" + (parameter++);
          params.push(options.limit);
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
   * Returns the count of the fires.
   * @param {string} dateFrom - Initial date
   * @param {string} dateTo - Final date
   * @param {json} filterRules - Filter rules
   * @param {json} options - Filtering options
   * @param {databaseOperationCallback} callback - Callback function
   * @returns {databaseOperationCallback} callback - Execution of the callback function, which will process the received data
   *
   * @function getFiresTotalCount
   * @memberof Graphics
   * @inner
   */
  this.getFiresTotalCount = function(dateFrom, dateTo, filterRules, options, callback) {
    // Counter of the query parameters
    var parameter = 1;

    // Connection with the PostgreSQL database
    memberPgConnectionPool.getConnectionPool().connect(function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "select count(*) as count from " + memberTablesConfig.Fires.Schema + "." + memberTablesConfig.Fires.TableName +
        " where (" + memberTablesConfig.Fires.DateFieldName + " between $" + (parameter++) + " and $" + (parameter++) + ")",
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
        if(options.countries !== undefined && !filterRules.ignoreCountryFilter) {
          var countriesArray = options.countries.split(',');
          query += " and " + memberTablesConfig.Fires.CountryFieldName + " in (";

          for(var i = 0; i < countriesArray.length; i++) {
            query += "$" + (parameter++) + ",";
            params.push(countriesArray[i]);
          }

          query = query.substring(0, (query.length - 1)) + ")";
        }

        // If the 'options.states' parameter exists, a states 'where' clause is created
        if(options.states !== undefined && !filterRules.ignoreStateFilter) {
          var statesArray = options.states.split(',');
          query += " and " + memberTablesConfig.Fires.StateFieldName + " in (";

          for(var i = 0; i < statesArray.length; i++) {
            query += "$" + (parameter++) + ",";
            params.push(statesArray[i]);
          }

          query = query.substring(0, (query.length - 1)) + ")";
        }

        // If the 'options.cities' parameter exists, a cities 'where' clause is created
        if(options.cities !== undefined && !filterRules.ignoreCityFilter) {
          var citiesArray = options.cities.split(',');
          query += " and " + memberTablesConfig.Fires.CityFieldName + " in (";

          for(var i = 0; i < citiesArray.length; i++) {
            query += "$" + (parameter++) + ",";
            params.push(citiesArray[i]);
          }

          query = query.substring(0, (query.length - 1)) + ")";
        }

        // If the 'options.limit' parameter exists, a limit clause is created
        if(options.limit !== undefined) {
          query += " limit $" + (parameter++);
          params.push(options.limit);
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
   * Returns the count of the fires grouped by week.
   * @param {string} dateFrom - Initial date
   * @param {string} dateTo - Final date
   * @param {json} filterRules - Filter rules
   * @param {json} options - Filtering options
   * @param {databaseOperationCallback} callback - Callback function
   * @returns {databaseOperationCallback} callback - Execution of the callback function, which will process the received data
   *
   * @function getFiresCountByWeek
   * @memberof Graphics
   * @inner
   */
  this.getFiresCountByWeek = function(dateFrom, dateTo, filterRules, options, callback) {
    // Counter of the query parameters
    var parameter = 1;

    // Connection with the PostgreSQL database
    memberPgConnectionPool.getConnectionPool().connect(function(err, client, done) {
      if(!err) {
        // Creation of the query
        var query = "select TO_CHAR(date_trunc('week', " + memberTablesConfig.Fires.DateFieldName + ")::date, 'YYYY/MM/DD') as start, " +
        "TO_CHAR((date_trunc('week', " + memberTablesConfig.Fires.DateFieldName + ") + '6 days')::date, 'YYYY/MM/DD') as end, count(*) AS count " +
        "from " + memberTablesConfig.Fires.Schema + "." + memberTablesConfig.Fires.TableName +
        " where (" + memberTablesConfig.Fires.DateFieldName + " between $" + (parameter++) + " and $" + (parameter++) + ")",
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
        if(options.countries !== undefined && !filterRules.ignoreCountryFilter) {
          var countriesArray = options.countries.split(',');
          query += " and " + memberTablesConfig.Fires.CountryFieldName + " in (";

          for(var i = 0; i < countriesArray.length; i++) {
            query += "$" + (parameter++) + ",";
            params.push(countriesArray[i]);
          }

          query = query.substring(0, (query.length - 1)) + ")";
        }

        // If the 'options.states' parameter exists, a states 'where' clause is created
        if(options.states !== undefined && !filterRules.ignoreStateFilter) {
          var statesArray = options.states.split(',');
          query += " and " + memberTablesConfig.Fires.StateFieldName + " in (";

          for(var i = 0; i < statesArray.length; i++) {
            query += "$" + (parameter++) + ",";
            params.push(statesArray[i]);
          }

          query = query.substring(0, (query.length - 1)) + ")";
        }

        // If the 'options.cities' parameter exists, a cities 'where' clause is created
        if(options.cities !== undefined && !filterRules.ignoreCityFilter) {
          var citiesArray = options.cities.split(',');
          query += " and " + memberTablesConfig.Fires.CityFieldName + " in (";

          for(var i = 0; i < citiesArray.length; i++) {
            query += "$" + (parameter++) + ",";
            params.push(citiesArray[i]);
          }

          query = query.substring(0, (query.length - 1)) + ")";
        }

        query += "group by 1, 2 order by 1, 2";

        // If the 'options.limit' parameter exists, a limit clause is created
        if(options.limit !== undefined) {
          query += " limit $" + (parameter++);
          params.push(options.limit);
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
};

module.exports = Graphics;
