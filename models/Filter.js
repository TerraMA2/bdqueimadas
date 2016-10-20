"use strict";

/**
 * Filter model, which contains filter related database manipulations.
 * @class Filter
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberPath - 'path' module.
 * @property {object} memberPgConnectionPool - 'PgConnectionPool' module.
 * @property {json} memberFilterConfig - Filter configuration.
 * @property {json} memberTablesConfig - Tables configuration.
 */
var Filter = function() {

  // 'path' module
  var memberPath = require('path');
  // 'PgConnectionPool' module
  //var memberPgConnectionPool = new (require(memberPath.join(__dirname, '../modules/PgConnectionPool.js')))();
  // Filter configuration
  var memberFilterConfig = require(memberPath.join(__dirname, '../configurations/Filter.json'));
  // Tables configuration
  var memberTablesConfig = require(memberPath.join(__dirname, '../configurations/Tables.json'));

  /**
   * Returns the count of the fires.
   * @param {object} pgPool - PostgreSQL connection pool
   * @param {string} dateTimeFrom - Initial date / time
   * @param {string} dateTimeTo - Final date / time
   * @param {json} options - Filtering options
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getFiresCount
   * @memberof Filter
   * @inner
   */
  this.getFiresCount = function(pgPool, dateTimeFrom, dateTimeTo, options, callback) {
    // Counter of the query parameters
    var parameter = 1;

    // Connection with the PostgreSQL database
    pgPool.connect(function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "select count(*) as count from " + memberTablesConfig.Fires.Schema + "." + memberTablesConfig.Fires.TableName +
        " where (" + memberTablesConfig.Fires.DateTimeFieldName + " between $" + (parameter++) + " and $" + (parameter++) + ")",
            params = [dateTimeFrom, dateTimeTo];

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

        // If the 'options.extent' parameter exists, a extent 'where' clause is created
        if(options.extent !== undefined) {
          query += " and ST_Intersects(" + memberTablesConfig.Fires.GeometryFieldName + ", ST_MakeEnvelope($" + (parameter++) + ", $" + (parameter++) + ", $" + (parameter++) + ", $" + (parameter++) + ", 4326))";
          params.push(options.extent[0], options.extent[1], options.extent[2], options.extent[3]);
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
   * Returns a list of continents.
   * @param {object} pgPool - PostgreSQL connection pool
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getContinents
   * @memberof Filter
   * @inner
   */
  this.getContinents = function(pgPool, callback) {
    // Connection with the PostgreSQL database
    pgPool.connect(function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "select " + memberTablesConfig.Continents.IdFieldName + " as id, " + memberTablesConfig.Continents.NameFieldName +
        " as name from " + memberTablesConfig.Continents.Schema + "." + memberTablesConfig.Continents.TableName + " where lower(" + memberTablesConfig.Continents.NameFieldName +
        ") like '%america%' or lower(" + memberTablesConfig.Continents.NameFieldName + ") like '%europe%' or lower(" + memberTablesConfig.Continents.NameFieldName + ") like '%africa%' order by " +
        "case " +
        "when lower(" + memberTablesConfig.Continents.NameFieldName + ") like '%south_america%' then 1 " +
        "when lower(" + memberTablesConfig.Continents.NameFieldName + ") like '%america%' then 2 " +
        "when lower(" + memberTablesConfig.Continents.NameFieldName + ") like '%africa%' then 3 " +
        "when lower(" + memberTablesConfig.Continents.NameFieldName + ") like '%europe%' then 4 " +
        "else 5 " +
        "end, " + memberTablesConfig.Continents.NameFieldName + ";";

        // Execution of the query
        client.query(query, function(err, result) {
          done();
          if(!err) return callback(null, result);
          else return callback(err);
        });
      } else return callback(err);
    });
  };

  /**
   * Returns a continent filtered by the received country id.
   * @param {object} pgPool - PostgreSQL connection pool
   * @param {string} country - Country id
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getContinentByCountry
   * @memberof Filter
   * @inner
   */
  this.getContinentByCountry = function(pgPool, country, callback) {
    // Connection with the PostgreSQL database
    pgPool.connect(function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "select a." + memberTablesConfig.Continents.IdFieldName + " as id, a." + memberTablesConfig.Continents.NameFieldName + " as name from " + memberTablesConfig.Continents.Schema + "." + memberTablesConfig.Continents.TableName + " a inner join " + memberTablesConfig.Countries.Schema + "." + memberTablesConfig.Countries.TableName + " b on (a." + memberTablesConfig.Continents.IdFieldName + " = b." + memberTablesConfig.Countries.ContinentFieldName + ") where b." + memberTablesConfig.Countries.IdFieldName + " = $1;",
            params = [country];

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
   * Returns a continent filtered by the received state id.
   * @param {object} pgPool - PostgreSQL connection pool
   * @param {string} state - State id
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getContinentByState
   * @memberof Filter
   * @inner
   */
  this.getContinentByState = function(pgPool, state, callback) {
    // Connection with the PostgreSQL database
    pgPool.connect(function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "select a." + memberTablesConfig.Continents.IdFieldName + " as id, a." + memberTablesConfig.Continents.NameFieldName + " as name from " + memberTablesConfig.Continents.Schema + "." + memberTablesConfig.Continents.TableName + " a inner join " + memberTablesConfig.Countries.Schema + "." + memberTablesConfig.Countries.TableName + " b on (a." + memberTablesConfig.Continents.IdFieldName + " = b." + memberTablesConfig.Countries.ContinentFieldName + ") inner join " + memberTablesConfig.States.Schema + "." + memberTablesConfig.States.TableName + " c on (b." + memberTablesConfig.Countries.IdFieldName + " = c." + memberTablesConfig.Countries.IdFieldName + ") where c." + memberTablesConfig.States.IdFieldName + " = $1;",
            params = [state];

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
   * Returns a list of countries filtered by the received states ids.
   * @param {object} pgPool - PostgreSQL connection pool
   * @param {array} states - States ids
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getCountriesByStates
   * @memberof Filter
   * @inner
   */
  this.getCountriesByStates = function(pgPool, states, callback) {
    // Connection with the PostgreSQL database
    pgPool.connect(function(err, client, done) {
      if(!err) {
        var parameter = 1;
        var params = [];

        // Creation of the query
        var query = "select a." + memberTablesConfig.Countries.IdFieldName + " as id, a." + memberTablesConfig.Countries.NameFieldName + " as name, a." +
                    memberTablesConfig.Countries.BdqNameFieldName + " as bdq_name, c." + memberTablesConfig.Continents.IdFieldName + " as continent from " +
                    memberTablesConfig.Countries.Schema + "." + memberTablesConfig.Countries.TableName + " a inner join " + memberTablesConfig.States.Schema + "." +
                    memberTablesConfig.States.TableName + " b on (a." + memberTablesConfig.Countries.IdFieldName + " = b." + memberTablesConfig.Countries.IdFieldName +
                    ") inner join " + memberTablesConfig.Continents.Schema + "." + memberTablesConfig.Continents.TableName +
                    " c on (a." + memberTablesConfig.Countries.ContinentFieldName + " = c." + memberTablesConfig.Continents.IdFieldName +
                    ") where b." + memberTablesConfig.States.IdFieldName + " in (";

        for(var i = 0; i < states.length; i++) {
          query += "$" + (parameter++) + ",";
          params.push(states[i]);
        }

        query = query.substring(0, (query.length - 1)) + ");";

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
   * Returns a list of countries filtered by the received continent id.
   * @param {object} pgPool - PostgreSQL connection pool
   * @param {string} continent - Continent id
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getCountriesByContinent
   * @memberof Filter
   * @inner
   */
  this.getCountriesByContinent = function(pgPool, continent, callback) {
    // Connection with the PostgreSQL database
    pgPool.connect(function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "select " + memberTablesConfig.Countries.IdFieldName + " as id, " + memberTablesConfig.Countries.NameFieldName + " as name from " + memberTablesConfig.Countries.Schema + "." + memberTablesConfig.Countries.TableName + " where " + memberTablesConfig.Countries.ContinentFieldName + " = $1 order by " + memberTablesConfig.Countries.NameFieldName + " asc;",
            params = [continent];

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
   * Returns a list of states filtered by the received country id.
   * @param {object} pgPool - PostgreSQL connection pool
   * @param {number} country - Country id
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getStatesByCountry
   * @memberof Filter
   * @inner
   */
  this.getStatesByCountry = function(pgPool, country, callback) {
    // Connection with the PostgreSQL database
    pgPool.connect(function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "select " + memberTablesConfig.States.IdFieldName + " as id, " + memberTablesConfig.States.NameFieldName + " as name from " + memberTablesConfig.States.Schema + "." + memberTablesConfig.States.TableName + " where " + memberTablesConfig.Countries.IdFieldName + " = $1 order by " + memberTablesConfig.States.NameFieldName + " asc;",
            params = [country];

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
   * Returns the continent extent correspondent to the received id.
   * @param {object} pgPool - PostgreSQL connection pool
   * @param {number} continent - Continent id
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getContinentExtent
   * @memberof Filter
   * @inner
   */
  this.getContinentExtent = function(pgPool, continent, callback) {
    // Connection with the PostgreSQL database
    pgPool.connect(function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "select ST_Extent(" + memberTablesConfig.Continents.GeometryFieldName + ") as extent from " + memberTablesConfig.Continents.Schema + "." + memberTablesConfig.Continents.TableName + " where " + memberTablesConfig.Continents.IdFieldName + " = $1;",
            params = [continent];

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
   * Returns a list of states filtered by the received countries ids.
   * @param {object} pgPool - PostgreSQL connection pool
   * @param {array} countries - Countries ids
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getStatesByCountries
   * @memberof Filter
   * @inner
   */
  this.getStatesByCountries = function(pgPool, countries, callback) {
    // Connection with the PostgreSQL database
    pgPool.connect(function(err, client, done) {
      if(!err) {
        var parameter = 1;
        var params = [];

        // Creation of the query
        var query = "select " + memberTablesConfig.States.IdFieldName + " as id, " + memberTablesConfig.States.NameFieldName + " as name from " +
        memberTablesConfig.States.Schema + "." + memberTablesConfig.States.TableName +
        " where " + memberTablesConfig.Countries.IdFieldName + " in (";

        for(var i = 0; i < countries.length; i++) {
          query += "$" + (parameter++) + ",";
          params.push(countries[i]);
        }

        query = query.substring(0, (query.length - 1)) + ") order by " + memberTablesConfig.Countries.NameFieldName + " asc, " + memberTablesConfig.States.NameFieldName + " asc;";

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
   * Returns the countries extent correspondent to the received ids.
   * @param {object} pgPool - PostgreSQL connection pool
   * @param {array} countries - Countries ids
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getCountriesExtent
   * @memberof Filter
   * @inner
   */
  this.getCountriesExtent = function(pgPool, countries, callback) {
    // Connection with the PostgreSQL database
    pgPool.connect(function(err, client, done) {
      if(!err) {
        var parameter = 1;
        var params = [];

        // Creation of the query
        var query = "select ST_Extent(" + memberTablesConfig.Countries.GeometryFieldName + ") as extent from " + memberTablesConfig.Countries.Schema + "." +
        memberTablesConfig.Countries.TableName + " where " + memberTablesConfig.Countries.IdFieldName + " in (";

        for(var i = 0; i < countries.length; i++) {
          query += "$" + (parameter++) + ",";
          params.push(countries[i]);
        }

        query = query.substring(0, (query.length - 1)) + ")";

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
   * Returns the states extent correspondent to the received ids.
   * @param {object} pgPool - PostgreSQL connection pool
   * @param {array} states - States ids
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getStatesExtent
   * @memberof Filter
   * @inner
   */
  this.getStatesExtent = function(pgPool, states, callback) {
    // Connection with the PostgreSQL database
    pgPool.connect(function(err, client, done) {
      if(!err) {
        var parameter = 1;
        var params = [];

        // Creation of the query
        var query = "select ST_Extent(" + memberTablesConfig.States.GeometryFieldName + ") as extent from " + memberTablesConfig.States.Schema + "." +
        memberTablesConfig.States.TableName + " where " + memberTablesConfig.States.IdFieldName + " in (";

        for(var i = 0; i < states.length; i++) {
          query += "$" + (parameter++) + ",";
          params.push(states[i]);
        }

        query = query.substring(0, (query.length - 1)) + ")";

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
   * Returns the special regions extent correspondent to the received ids.
   * @param {object} pgPool - PostgreSQL connection pool
   * @param {array} specialRegions - Special regions ids
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getSpecialRegionsExtent
   * @memberof Filter
   * @inner
   */
  this.getSpecialRegionsExtent = function(pgPool, specialRegions, callback) {
    // Connection with the PostgreSQL database
    pgPool.connect(function(err, client, done) {
      if(!err) {
        var parameter = 1;
        var params = [];

        // Creation of the query
        var query = "select ST_Extent(" + memberTablesConfig.SpecialRegions.GeometryFieldName + ") as extent from " + memberTablesConfig.SpecialRegions.Schema + "." +
        memberTablesConfig.SpecialRegions.TableName + " where " + memberTablesConfig.SpecialRegions.IdFieldName + " in (";

        for(var i = 0; i < specialRegions.length; i++) {
          query += "$" + (parameter++) + ",";
          params.push(specialRegions[i]);
        }

        query = query.substring(0, (query.length - 1)) + ")";

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
   * Returns the states and special regions extent correspondent to the received ids.
   * @param {object} pgPool - PostgreSQL connection pool
   * @param {array} states - States ids
   * @param {array} specialRegions - Special regions ids
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getStatesAndSpecialRegionsExtent
   * @memberof Filter
   * @inner
   */
  this.getStatesAndSpecialRegionsExtent = function(pgPool, states, specialRegions, callback) {
    // Connection with the PostgreSQL database
    pgPool.connect(function(err, client, done) {
      if(!err) {
        var parameter = 1;
        var params = [];

        // Creation of the query
        var query = "WITH all_geoms AS(" +
        "SELECT ST_Extent(" + memberTablesConfig.States.GeometryFieldName + ") as extent FROM " + memberTablesConfig.States.Schema + "." +
        memberTablesConfig.States.TableName + " where " + memberTablesConfig.States.IdFieldName + " in (";

        for(var i = 0; i < states.length; i++) {
          query += "$" + (parameter++) + ",";
          params.push(states[i]);
        }

        query = query.substring(0, (query.length - 1)) + ") UNION ALL " +
        "SELECT ST_Extent(" + memberTablesConfig.SpecialRegions.GeometryFieldName + ") as extent FROM " + memberTablesConfig.SpecialRegions.Schema + "." +
        memberTablesConfig.SpecialRegions.TableName + " where " + memberTablesConfig.SpecialRegions.IdFieldName + " in (";

        for(var i = 0; i < specialRegions.length; i++) {
          query += "$" + (parameter++) + ",";
          params.push(specialRegions[i]);
        }

        query = query.substring(0, (query.length - 1)) + ")) SELECT ST_Extent(extent) as extent FROM all_geoms";

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
   * Returns the extent of the protected area corresponding to the received id.
   * @param {object} pgPool - PostgreSQL connection pool
   * @param {integer} id - Id of the protected area
   * @param {string} type - Type of the protected area (TI, UCE or UCF)
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getProtectedAreaExtent
   * @memberof Filter
   * @inner
   */
  this.getProtectedAreaExtent = function(pgPool, id, type, callback) {
    var parameters = [parseInt(id)];

    // Connection with the PostgreSQL database
    pgPool.connect(function(err, client, done) {
      if(!err) {
        if(type === 'UCE') {
          var schemaAndTable = memberTablesConfig.UCE.Schema + "." + memberTablesConfig.UCE.TableName;
          var geom = memberTablesConfig.UCE.GeometryFieldName;
          var id = memberTablesConfig.UCE.IdFieldName;
        } else if(type === 'UCF') {
          var schemaAndTable = memberTablesConfig.UCF.Schema + "." + memberTablesConfig.UCF.TableName;
          var geom = memberTablesConfig.UCF.GeometryFieldName;
          var id = memberTablesConfig.UCF.IdFieldName;
        } else {
          var schemaAndTable = memberTablesConfig.TI.Schema + "." + memberTablesConfig.TI.TableName;
          var geom = memberTablesConfig.TI.GeometryFieldName;
          var id = memberTablesConfig.TI.IdFieldName;
        }

        // Creation of the query
        var query = "select ST_Extent(" + geom + ") as extent from " + schemaAndTable + " where " + id + " = $1;";

        // Execution of the query
        client.query(query, parameters, function(err, result) {
          done();
          if(!err) return callback(null, result);
          else return callback(err);
        });
      } else return callback(err);
    });
  };

  /**
   * Returns the extent of the city corresponding to the received id.
   * @param {object} pgPool - PostgreSQL connection pool
   * @param {string} id - Id of the city
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getCityExtent
   * @memberof Filter
   * @inner
   */
  this.getCityExtent = function(pgPool, id, callback) {
    var parameters = [id];

    // Connection with the PostgreSQL database
    pgPool.connect(function(err, client, done) {
      if(!err) {
        // Creation of the query
        var query = "select ST_Extent(" + memberTablesConfig.Cities.GeometryFieldName + ") as extent from " + memberTablesConfig.Cities.Schema + "." + memberTablesConfig.Cities.TableName + " where " + memberTablesConfig.Cities.IdFieldName + " = $1;";

        // Execution of the query
        client.query(query, parameters, function(err, result) {
          done();
          if(!err) return callback(null, result);
          else return callback(err);
        });
      } else return callback(err);
    });
  };

  /**
   * Returns the number of the fires located in the country correspondent to the received id.
   * @param {object} pgPool - PostgreSQL connection pool
   * @param {number} country - Country id
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getFiresCountByCountry
   * @memberof Filter
   * @inner
   */
  this.getFiresCountByCountry = function(pgPool, country, callback) {
    // Connection with the PostgreSQL database
    pgPool.connect(function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "select count(*) as firescount from " + memberTablesConfig.Fires.Schema + "." + memberTablesConfig.Fires.TableName + " where " + memberTablesConfig.Fires.CountryFieldName + " = $1;",
            params = [country];

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
   * Returns the data of the polygon that intersects with the received point.
   * @param {object} pgPool - PostgreSQL connection pool
   * @param {string} longitude - Longitude of the point
   * @param {string} latitude - Latitude of the point
   * @param {float} resolution - Current map resolution
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getDataByIntersection
   * @memberof Filter
   * @inner
   */
  this.getDataByIntersection = function(pgPool, longitude, latitude, resolution, callback) {
    // Connection with the PostgreSQL database
    pgPool.connect(function(err, client, done) {
      if(!err) {

        var key = "States";

        if(resolution >= memberFilterConfig.SpatialFilter.Continents.MinResolution)
          key = "Continents";
        else if(resolution >= memberFilterConfig.SpatialFilter.Countries.MinResolution && resolution < memberFilterConfig.SpatialFilter.Countries.MaxResolution)
          key = "Countries";

        // Creation of the query
        var query = "SELECT " + memberTablesConfig[key].IdFieldName + " as id, " + memberTablesConfig[key].NameFieldName + " as name, '" + key + "' as key";

        if(key !== "Continents") {
          query += ", " + memberTablesConfig[key].BdqNameFieldName + " as bdq_name";
        }

        query += " FROM " + memberTablesConfig[key].Schema + "." + memberTablesConfig[key].TableName + " WHERE ST_Intersects(" + memberTablesConfig[key].GeometryFieldName + ", ST_SetSRID(ST_MakePoint($1, $2), 4326));";

        var params = [longitude, latitude];

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
   * Returns the BDQ names of the received countries ids.
   * @param {object} pgPool - PostgreSQL connection pool
   * @param {array} countries - Countries ids
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getCountriesBdqNames
   * @memberof Filter
   * @inner
   */
  this.getCountriesBdqNames = function(pgPool, countries, callback) {
    // Connection with the PostgreSQL database
    pgPool.connect(function(err, client, done) {
      if(!err) {
        var parameter = 1;
        var params = [];

        // Creation of the query
        var query = "select " + memberTablesConfig.Countries.BdqNameFieldName + " as name from " + memberTablesConfig.Countries.Schema + "." +
                    memberTablesConfig.Countries.TableName + " where " + memberTablesConfig.Countries.IdFieldName + " in (";

        for(var i = 0; i < countries.length; i++) {
          query += "$" + (parameter++) + ",";
          params.push(countries[i]);
        }

        if(countries.length > 0) {
          query = query.substring(0, (query.length - 1)) + ") order by " + memberTablesConfig.Countries.BdqNameFieldName + " asc;";
        } else {
          query += "'0') order by " + memberTablesConfig.Countries.BdqNameFieldName + " asc;";
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
   * Returns the BDQ names of the received states ids.
   * @param {object} pgPool - PostgreSQL connection pool
   * @param {array} states - States ids
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getStatesBdqNames
   * @memberof Filter
   * @inner
   */
  this.getStatesBdqNames = function(pgPool, states, callback) {
    // Connection with the PostgreSQL database
    pgPool.connect(function(err, client, done) {
      if(!err) {
        var parameter = 1;
        var params = [];

        // Creation of the query
        var query = "select " + memberTablesConfig.States.BdqNameFieldName + " as name from " + memberTablesConfig.States.Schema + "." +
                    memberTablesConfig.States.TableName + " where " + memberTablesConfig.States.IdFieldName + " in (";

        for(var i = 0; i < states.length; i++) {
          query += "$" + (parameter++) + ",";
          params.push(states[i]);
        }

        if(states.length > 0) {
          query = query.substring(0, (query.length - 1)) + ") order by " + memberTablesConfig.States.BdqNameFieldName + " asc;";
        } else {
          query += "'0') order by " + memberTablesConfig.States.BdqNameFieldName + " asc;";
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
   * Returns the satellites for the given filter.
   * @param {object} pgPool - PostgreSQL connection pool
   * @param {string} dateTimeFrom - Initial date / time
   * @param {string} dateTimeTo - Final date / time
   * @param {json} options - Filtering options
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getSatellites
   * @memberof Filter
   * @inner
   */
  this.getSatellites = function(pgPool, dateTimeFrom, dateTimeTo, options, callback) {
    // Connection with the PostgreSQL database
    pgPool.connect(function(err, client, done) {
      if(!err) {
        // Counter of the query parameters
        var parameter = 1;

        // Creation of the query
        var query = "select distinct " + memberTablesConfig.Fires.SatelliteFieldName + " from " + memberTablesConfig.Fires.Schema + "." + memberTablesConfig.Fires.TableName +
            " where (" + memberTablesConfig.Fires.DateTimeFieldName + " between $" + (parameter++) + " and $" + (parameter++) + ")",
            params = [dateTimeFrom, dateTimeTo];

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

        // If the 'options.extent' parameter exists, a extent 'where' clause is created
        if(options.extent !== undefined) {
          query += " and ST_Intersects(" + memberTablesConfig.Fires.GeometryFieldName + ", ST_MakeEnvelope($" + (parameter++) + ", $" + (parameter++) + ", $" + (parameter++) + ", $" + (parameter++) + ", 4326))";
          params.push(options.extent[0], options.extent[1], options.extent[2], options.extent[3]);
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
   * Returns the special regions.
   * @param {object} pgPool - PostgreSQL connection pool
   * @param {array} countries - Filtered countries
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getSpecialRegions
   * @memberof Filter
   * @inner
   */
  this.getSpecialRegions = function(pgPool, countries, callback) {
    // Connection with the PostgreSQL database
    pgPool.connect(function(err, client, done) {
      if(!err) {
        var specialRegions = "";

        for(var i = 0, specialRegionsLength = memberFilterConfig.SpecialRegions.length; i < specialRegionsLength; i++) {
          var inArray = false;

          for(var j = 0, countriesLength = countries.length; j < countriesLength; j++) {
            for(var x = 0, specialRegionsCountriesLength = memberFilterConfig.SpecialRegions[i].Countries.length; x < specialRegionsCountriesLength; x++) {
              if(countries[j] == memberFilterConfig.SpecialRegions[i].Countries[x]) {
                inArray = true;
                break;
              }
            }

            if(inArray) break;
          }

          if(inArray) specialRegions += memberFilterConfig.SpecialRegions[i].Id + ",";
        }

        specialRegions = specialRegions != "" ? specialRegions.substring(0, specialRegions.length - 1) : "0";

        // Creation of the query
        var query = "select " + memberTablesConfig.SpecialRegions.IdFieldName + " as id, " + memberTablesConfig.SpecialRegions.NameFieldName + " as name from " + memberTablesConfig.SpecialRegions.Schema + "." + memberTablesConfig.SpecialRegions.TableName + " where gid in (" + specialRegions + ") order by " + memberTablesConfig.SpecialRegions.NameFieldName + " asc;";

        // Execution of the query
        client.query(query, function(err, result) {
          done();
          if(!err) return callback(null, result);
          else return callback(err);
        });
      } else return callback(err);
    });
  };

  /**
   * Returns the protected areas that match the given value.
   * @param {object} pgPool - PostgreSQL connection pool
   * @param {string} value - Value to be used in the search of protected areas
   * @param {object} searchFor - Flags that indicates in which tables the search should be performed. Format: { 'UCE': true/false, 'UCF': true/false, 'TI': true/false }
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function searchForPAs
   * @memberof Filter
   * @inner
   */
  this.searchForPAs = function(pgPool, value, searchFor, callback) {
    // Connection with the PostgreSQL database
    pgPool.connect(function(err, client, done) {
      if(!err) {
        var parameters = [];

        var tiQuery = "select " + memberTablesConfig.TI.IdFieldName + " as id, upper(" + memberTablesConfig.TI.NameFieldName + ") as name, 'TI' as type " +
        "from " + memberTablesConfig.TI.Schema + "." + memberTablesConfig.TI.TableName +
        " where unaccent(upper(" + memberTablesConfig.TI.NameFieldName + ")) like unaccent(upper(_SEARCH_))";

        var uceQuery = "select " + memberTablesConfig.UCE.IdFieldName + " as id, upper(" + memberTablesConfig.UCE.NameFieldName + ") as name, 'UCE' as type " +
        "from " + memberTablesConfig.UCE.Schema + "." + memberTablesConfig.UCE.TableName +
        " where unaccent(upper(" + memberTablesConfig.UCE.NameFieldName + ")) like unaccent(upper(_SEARCH_))";

        var ucfQuery = "select " + memberTablesConfig.UCF.IdFieldName + " as id, upper(" + memberTablesConfig.UCF.NameFieldName + ") as name, 'UCF' as type " +
        "from " + memberTablesConfig.UCF.Schema + "." + memberTablesConfig.UCF.TableName +
        " where unaccent(upper(" + memberTablesConfig.UCF.NameFieldName + ")) like unaccent(upper(_SEARCH_))";

        var query = "";

        if(searchFor.TI) {
          parameters.push('%' + value + '%');
          query += tiQuery.replace('_SEARCH_', '$' + parameters.length);
        }

        if(searchFor.UCE) {
          parameters.push('%' + value + '%');
          query += (parameters.length > 1 ? ' union ' : '') + uceQuery.replace('_SEARCH_', '$' + parameters.length);
        }

        if(searchFor.UCF) {
          parameters.push('%' + value + '%');
          query += (parameters.length > 1 ? ' union ' : '') + ucfQuery.replace('_SEARCH_', '$' + parameters.length);
        }

        // Execution of the query
        client.query(query, parameters, function(err, result) {
          done();
          if(!err) return callback(null, result);
          else return callback(err);
        });
      } else return callback(err);
    });
  };

  /**
   * Returns the cities that match the given value.
   * @param {object} pgPool - PostgreSQL connection pool
   * @param {string} value - Value to be used in the search of cities
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function searchForCities
   * @memberof Filter
   * @inner
   */
  this.searchForCities = function(pgPool, value, countries, states, callback) {
    // Counter of the query parameters
    var parameter = 1;

    // Connection with the PostgreSQL database
    pgPool.connect(function(err, client, done) {
      if(!err) {
        var query = "select " + memberTablesConfig.Cities.IdFieldName + " as id, upper(" + memberTablesConfig.Cities.NameFieldName +
                    ") as name, " + memberTablesConfig.Cities.StateNameFieldName + " as state " +
                    "from " + memberTablesConfig.Cities.Schema + "." + memberTablesConfig.Cities.TableName +
                    " where unaccent(upper(" + memberTablesConfig.Cities.NameFieldName + ")) like unaccent(upper($" + (parameter++) + "))";
        var parameters = ['%' + value + '%'];

        if(countries !== null) {
          var countriesArray = countries.split(',');
          query += " and " + memberTablesConfig.Cities.CountryIdFieldName + " in (";

          for(var i = 0; i < countriesArray.length; i++) {
            query += "$" + (parameter++) + ",";
            parameters.push(countriesArray[i]);
          }

          query = query.substring(0, (query.length - 1)) + ")";
        }

        if(states !== null) {
          var statesArray = states.split(',');
          query += " and " + memberTablesConfig.Cities.StateIdFieldName + " in (";

          for(var i = 0; i < statesArray.length; i++) {
            query += "$" + (parameter++) + ",";
            parameters.push(statesArray[i]);
          }

          query = query.substring(0, (query.length - 1)) + ")";
        }

        // Execution of the query
        client.query(query, parameters, function(err, result) {
          done();
          if(!err) return callback(null, result);
          else return callback(err);
        });
      } else return callback(err);
    });
  };
};

module.exports = Filter;
