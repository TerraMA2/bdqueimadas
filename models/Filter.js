"use strict";

/**
 * Filter model, which contains filter related database manipulations.
 * @class Filter
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberPath - 'path' module.
 * @property {json} memberFilterConfig - Filter configuration.
 * @property {json} memberTablesConfig - Tables configuration.
 * @property {object} memberUtils - 'Utils' model.
 */
var Filter = function() {

  // 'path' module
  var memberPath = require('path');
  // Filter configuration
  var memberFilterConfig = require(memberPath.join(__dirname, '../configurations/Filter.json'));
  // Tables configuration
  var memberTablesConfig = require(memberPath.join(__dirname, '../configurations/Tables.json'));
  // 'Utils' model
  var memberUtils = new (require('./Utils.js'))();

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

        var getFiltersResult = memberUtils.getFilters(options, query, params, parameter);

        query = getFiltersResult.query;
        params = getFiltersResult.params;
        parameter = getFiltersResult.parameter;

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

        for(var i = 0, statesLength = states.length; i < statesLength; i++) {
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
        var query = "select distinct " + memberTablesConfig.Countries.IdFieldName + " as id, " + memberTablesConfig.Countries.NameFieldName + " as name from " + memberTablesConfig.Countries.Schema + "." + memberTablesConfig.Countries.TableName + " where " + memberTablesConfig.Countries.ContinentFieldName + " = $1 order by " + memberTablesConfig.Countries.NameFieldName + " asc;",
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
    if(memberFilterConfig.Extents.Continents[continent] !== undefined) {
      var confExtent = memberFilterConfig.Extents.Continents[continent].split(',');
      return callback(null, { rowCount: 1, rows: [{ extent: "BOX(" + confExtent[0] + " " + confExtent[1] + "," + confExtent[2] + " " + confExtent[3] + ")" }] });
    }

    // Connection with the PostgreSQL database
    pgPool.connect(function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "select ST_Expand(ST_Extent(" + memberTablesConfig.Continents.GeometryFieldName + "), 2) as extent from " + memberTablesConfig.Continents.Schema + "." + memberTablesConfig.Continents.TableName + " where " + memberTablesConfig.Continents.IdFieldName + " = $1;",
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

        for(var i = 0, countriesLength = countries.length; i < countriesLength; i++) {
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
    if(countries.length === 1 && memberFilterConfig.Extents.Countries[countries[0]] !== undefined) {
      var confExtent = memberFilterConfig.Extents.Countries[countries[0]].split(',');
      return callback(null, { rowCount: 1, rows: [{ extent: "BOX(" + confExtent[0] + " " + confExtent[1] + "," + confExtent[2] + " " + confExtent[3] + ")" }] });
    }

    var countriesWithExtent = [];
    var countriesWithoutExtent = [];

    for(var i = 0, countriesLength = countries.length; i < countriesLength; i++) {
      if(memberFilterConfig.Extents.Countries[countries[i]] !== undefined)
        countriesWithExtent.push(countries[i]);
      else
        countriesWithoutExtent.push(countries[i]);
    }

    var unionGeoms = "";

    if(countriesWithExtent.length > 0) {
      for(var i = 0, countriesWithExtentLength = countriesWithExtent.length; i < countriesWithExtentLength; i++)
        unionGeoms += "ST_MakeEnvelope(" + memberFilterConfig.Extents.Countries[countriesWithExtent[i]] + ", 4326), ";

      unionGeoms = unionGeoms.substring(0, (unionGeoms.length - 2));
    }

    // Connection with the PostgreSQL database
    pgPool.connect(function(err, client, done) {
      if(!err) {
        var parameter = 1;
        var params = [];

        // Creation of the query
        if(countriesWithoutExtent.length > 0) {
          var query = "select ST_Expand(ST_Extent(";

          if(unionGeoms !== "")
            query += "ST_Collect(ARRAY[" + memberTablesConfig.Countries.GeometryFieldName + ", " + unionGeoms + "])";
          else
            query += memberTablesConfig.Countries.GeometryFieldName;

          query += "), 2) as extent from " + memberTablesConfig.Countries.Schema + "." + memberTablesConfig.Countries.TableName + " where " + memberTablesConfig.Countries.IdFieldName + " in (";

          for(var i = 0, countriesWithoutExtentLength = countriesWithoutExtent.length; i < countriesWithoutExtentLength; i++) {
            query += "$" + (parameter++) + ",";
            params.push(countriesWithoutExtent[i]);
          }

          query = query.substring(0, (query.length - 1)) + ")";
        } else
          var query = "select ST_Expand(ST_Extent(ST_Collect(ARRAY[" + unionGeoms + "])), 2) as extent";

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
    if(states.length === 1 && memberFilterConfig.Extents.States[states[0]] !== undefined) {
      var confExtent = memberFilterConfig.Extents.States[states[0]].split(',');
      return callback(null, { rowCount: 1, rows: [{ extent: "BOX(" + confExtent[0] + " " + confExtent[1] + "," + confExtent[2] + " " + confExtent[3] + ")" }] });
    }

    var statesWithExtent = [];
    var statesWithoutExtent = [];

    for(var i = 0, statesLength = states.length; i < statesLength; i++) {
      if(memberFilterConfig.Extents.States[states[i]] !== undefined)
        statesWithExtent.push(states[i]);
      else
        statesWithoutExtent.push(states[i]);
    }

    var unionGeoms = "";

    if(statesWithExtent.length > 0) {
      for(var i = 0, statesWithExtentLength = statesWithExtent.length; i < statesWithExtentLength; i++)
        unionGeoms += "ST_MakeEnvelope(" + memberFilterConfig.Extents.States[statesWithExtent[i]] + ", 4326), ";

      unionGeoms = unionGeoms.substring(0, (unionGeoms.length - 2));
    }

    // Connection with the PostgreSQL database
    pgPool.connect(function(err, client, done) {
      if(!err) {
        var parameter = 1;
        var params = [];

        // Creation of the query
        if(statesWithoutExtent.length > 0) {
          var query = "select ST_Expand(ST_Extent(";

          if(unionGeoms !== "")
            query += "ST_Collect(ARRAY[" + memberTablesConfig.States.GeometryFieldName + ", " + unionGeoms + "])";
          else
            query += memberTablesConfig.States.GeometryFieldName;

          query += "), 0.5) as extent from " + memberTablesConfig.States.Schema + "." + memberTablesConfig.States.TableName + " where " + memberTablesConfig.States.IdFieldName + " in (";

          for(var i = 0, statesWithoutExtentLength = statesWithoutExtent.length; i < statesWithoutExtentLength; i++) {
            query += "$" + (parameter++) + ",";
            params.push(statesWithoutExtent[i]);
          }

          query = query.substring(0, (query.length - 1)) + ")";
        } else
          var query = "select ST_Expand(ST_Extent(ST_Collect(ARRAY[" + unionGeoms + "])), 2) as extent";

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
    if(specialRegions.length === 1 && memberFilterConfig.Extents.SpecialRegions[specialRegions[0]] !== undefined) {
      var confExtent = memberFilterConfig.Extents.SpecialRegions[specialRegions[0]].split(',');
      return callback(null, { rowCount: 1, rows: [{ extent: "BOX(" + confExtent[0] + " " + confExtent[1] + "," + confExtent[2] + " " + confExtent[3] + ")" }] });
    }

    var specialRegionsWithExtent = [];
    var specialRegionsWithoutExtent = [];

    for(var i = 0, specialRegionsLength = specialRegions.length; i < specialRegionsLength; i++) {
      if(memberFilterConfig.Extents.SpecialRegions[specialRegions[i]] !== undefined)
        specialRegionsWithExtent.push(specialRegions[i]);
      else
        specialRegionsWithoutExtent.push(specialRegions[i]);
    }

    var unionGeoms = "";

    if(specialRegionsWithExtent.length > 0) {
      for(var i = 0, specialRegionsWithExtentLength = specialRegionsWithExtent.length; i < specialRegionsWithExtentLength; i++)
        unionGeoms += "ST_MakeEnvelope(" + memberFilterConfig.Extents.SpecialRegions[specialRegionsWithExtent[i]] + ", 4326), ";

      unionGeoms = unionGeoms.substring(0, (unionGeoms.length - 2));
    }

    // Connection with the PostgreSQL database
    pgPool.connect(function(err, client, done) {
      if(!err) {
        var parameter = 1;
        var params = [];

        // Creation of the query
        if(specialRegionsWithoutExtent.length > 0) {
          var query = "select ST_Expand(ST_Extent(";

          if(unionGeoms !== "")
            query += "ST_Collect(ARRAY[" + memberTablesConfig.SpecialRegions.GeometryFieldName + ", " + unionGeoms + "])";
          else
            query += memberTablesConfig.SpecialRegions.GeometryFieldName;

          query += "), 0.5) as extent from " + memberTablesConfig.SpecialRegions.Schema + "." + memberTablesConfig.SpecialRegions.TableName + " where " + memberTablesConfig.SpecialRegions.IdFieldName + " in (";

          for(var i = 0, specialRegionsWithoutExtentLength = specialRegionsWithoutExtent.length; i < specialRegionsWithoutExtentLength; i++) {
            query += "$" + (parameter++) + ",";
            params.push(specialRegionsWithoutExtent[i]);
          }

          query = query.substring(0, (query.length - 1)) + ")";
        } else
          var query = "select ST_Expand(ST_Extent(ST_Collect(ARRAY[" + unionGeoms + "])), 2) as extent";

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
    if(states.length === 1 && memberFilterConfig.Extents.States[states[0]] !== undefined) {
      var confExtent = memberFilterConfig.Extents.States[states[0]].split(',');
      return callback(null, { rowCount: 1, rows: [{ extent: "BOX(" + confExtent[0] + " " + confExtent[1] + "," + confExtent[2] + " " + confExtent[3] + ")" }] });
    }

    if(specialRegions.length === 1 && memberFilterConfig.Extents.SpecialRegions[specialRegions[0]] !== undefined) {
      var confExtent = memberFilterConfig.Extents.SpecialRegions[specialRegions[0]].split(',');
      return callback(null, { rowCount: 1, rows: [{ extent: "BOX(" + confExtent[0] + " " + confExtent[1] + "," + confExtent[2] + " " + confExtent[3] + ")" }] });
    }

    var statesWithExtent = [];
    var statesWithoutExtent = [];

    for(var i = 0, statesLength = states.length; i < statesLength; i++) {
      if(memberFilterConfig.Extents.States[states[i]] !== undefined)
        statesWithExtent.push(states[i]);
      else
        statesWithoutExtent.push(states[i]);
    }

    var unionGeomsStates = "";

    if(statesWithExtent.length > 0) {
      for(var i = 0, statesWithExtentLength = statesWithExtent.length; i < statesWithExtentLength; i++)
        unionGeomsStates += "ST_MakeEnvelope(" + memberFilterConfig.Extents.States[statesWithExtent[i]] + ", 4326), ";

      unionGeomsStates = unionGeomsStates.substring(0, (unionGeomsStates.length - 2));
    }

    var specialRegionsWithExtent = [];
    var specialRegionsWithoutExtent = [];

    for(var i = 0, specialRegionsLength = specialRegions.length; i < specialRegionsLength; i++) {
      if(memberFilterConfig.Extents.SpecialRegions[specialRegions[i]] !== undefined)
        specialRegionsWithExtent.push(specialRegions[i]);
      else
        specialRegionsWithoutExtent.push(specialRegions[i]);
    }

    var unionGeomsSpecialRegions = "";

    if(specialRegionsWithExtent.length > 0) {
      for(var i = 0, specialRegionsWithExtentLength = specialRegionsWithExtent.length; i < specialRegionsWithExtentLength; i++)
        unionGeomsSpecialRegions += "ST_MakeEnvelope(" + memberFilterConfig.Extents.SpecialRegions[specialRegionsWithExtent[i]] + ", 4326), ";

      unionGeomsSpecialRegions = unionGeomsSpecialRegions.substring(0, (unionGeomsSpecialRegions.length - 2));
    }

    // Connection with the PostgreSQL database
    pgPool.connect(function(err, client, done) {
      if(!err) {
        var parameter = 1;
        var params = [];

        // Creation of the query
        var query = "WITH all_geoms AS(";

        if(statesWithoutExtent.length > 0) {
          query += "SELECT ST_Expand(ST_Extent(";

          if(unionGeomsStates !== "")
            query += "ST_Collect(ARRAY[" + memberTablesConfig.States.GeometryFieldName + ", " + unionGeomsStates + "])";
          else
            query += memberTablesConfig.States.GeometryFieldName;

          query += "), 0.5) as extent FROM " + memberTablesConfig.States.Schema + "." + memberTablesConfig.States.TableName + " where " + memberTablesConfig.States.IdFieldName + " in (";

          for(var i = 0, statesWithoutExtentLength = statesWithoutExtent.length; i < statesWithoutExtentLength; i++) {
            query += "$" + (parameter++) + ",";
            params.push(statesWithoutExtent[i]);
          }

          query = query.substring(0, (query.length - 1)) + ")";
        } else
          var query = "select ST_Expand(ST_Extent(ST_Collect(ARRAY[" + unionGeomsStates + "])), 2) as extent";

        query += " UNION ALL ";

        if(specialRegionsWithoutExtent.length > 0) {
          query += "SELECT ST_Expand(ST_Extent(";

          if(unionGeomsSpecialRegions !== "")
            query += "ST_Collect(ARRAY[" + memberTablesConfig.SpecialRegions.GeometryFieldName + ", " + unionGeomsSpecialRegions + "])";
          else
            query += memberTablesConfig.SpecialRegions.GeometryFieldName;

          query += "), 0.5) as extent FROM " + memberTablesConfig.SpecialRegions.Schema + "." + memberTablesConfig.SpecialRegions.TableName + " where " + memberTablesConfig.SpecialRegions.IdFieldName + " in (";

          for(var i = 0, specialRegionsWithoutExtentLength = specialRegionsWithoutExtent.length; i < specialRegionsWithoutExtentLength; i++) {
            query += "$" + (parameter++) + ",";
            params.push(specialRegionsWithoutExtent[i]);
          }

          query = query.substring(0, (query.length - 1)) + ")";
        } else
          var query = "select ST_Expand(ST_Extent(ST_Collect(ARRAY[" + unionGeomsSpecialRegions + "])), 2) as extent";

        query += ") SELECT ST_Expand(ST_Extent(extent), 0.5) as extent FROM all_geoms";

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
  this.getProtectedAreaExtent = function(pgPool, id, ngo, type, callback) {
    if(memberFilterConfig.Extents.ProtectedAreas[type][id.toString() + ngo] !== undefined) {
      var confExtent = memberFilterConfig.Extents.ProtectedAreas[type][id.toString() + ngo].split(',');
      return callback(null, { rowCount: 1, rows: [{ extent: "BOX(" + confExtent[0] + " " + confExtent[1] + "," + confExtent[2] + " " + confExtent[3] + ")" }] });
    }

    var parameters = [id.toString() + ngo];

    // Connection with the PostgreSQL database
    pgPool.connect(function(err, client, done) {
      if(!err) {
        if(type === 'UCE') {
          var schemaAndTable = memberTablesConfig.UCE.Schema + "." + memberTablesConfig.UCE.TableName;
          var geom = memberTablesConfig.UCE.GeometryFieldName;
          var idField = memberTablesConfig.UCE.IdFieldName;
          var ngoField = memberTablesConfig.UCE.NGOFieldName;
        } else if(type === 'UCF') {
          var schemaAndTable = memberTablesConfig.UCF.Schema + "." + memberTablesConfig.UCF.TableName;
          var geom = memberTablesConfig.UCF.GeometryFieldName;
          var idField = memberTablesConfig.UCF.IdFieldName;
          var ngoField = memberTablesConfig.UCF.NGOFieldName;
        } else {
          var schemaAndTable = memberTablesConfig.TI.Schema + "." + memberTablesConfig.TI.TableName;
          var geom = memberTablesConfig.TI.GeometryFieldName;
          var idField = memberTablesConfig.TI.IdFieldName;
          var ngoField = memberTablesConfig.TI.NGOFieldName;
        }

        // Creation of the query
        var query = "select ST_Expand(ST_Extent(" + geom + "), 0.5) as extent from " + schemaAndTable + " where concat(" + idField + ", " + ngoField + ") = $1;";

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
    if(memberFilterConfig.Extents.Cities[id] !== undefined) {
      var confExtent = memberFilterConfig.Extents.Cities[id].split(',');
      return callback(null, { rowCount: 1, rows: [{ extent: "BOX(" + confExtent[0] + " " + confExtent[1] + "," + confExtent[2] + " " + confExtent[3] + ")" }] });
    }

    var parameters = [id];

    // Connection with the PostgreSQL database
    pgPool.connect(function(err, client, done) {
      if(!err) {
        // Creation of the query
        var query = "select ST_Expand(ST_Extent(" + memberTablesConfig.Cities.GeometryFieldName + "), 0.1) as extent from " + memberTablesConfig.Cities.Schema + "." + memberTablesConfig.Cities.TableName + " where " + memberTablesConfig.Cities.IdFieldName + " = $1;";

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

        for(var i = 0, countriesLength = countries.length; i < countriesLength; i++) {
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

        for(var i = 0, statesLength = states.length; i < statesLength; i++) {
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

        var getFiltersResult = memberUtils.getFilters(options, query, params, parameter);

        query = getFiltersResult.query;
        params = getFiltersResult.params;
        parameter = getFiltersResult.parameter;

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
    // Counter of the query parameters
    var parameter = 1;
    // Query parameters
    var params = [];

    // Connection with the PostgreSQL database
    pgPool.connect(function(err, client, done) {
      if(!err) {
        // Creation of the query
        var query = "select " + memberTablesConfig.SpecialRegions.IdFieldName + " as id, " + memberTablesConfig.SpecialRegions.NameFieldName + " as name from " + memberTablesConfig.SpecialRegions.Schema + "." + memberTablesConfig.SpecialRegions.TableName + " where " + memberTablesConfig.SpecialRegions.CountriesFieldName + " @> ARRAY[";

        for(var i = 0, countriesLength = countries.length; i < countriesLength; i++) {
          query += "$" + (parameter++) + ",";
          params.push(countries[i]);
        }

        query = query.substring(0, (query.length - 1)) + "]::integer[] order by " + memberTablesConfig.SpecialRegions.NameFieldName + " asc;";

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

        var tiQuery = "select " + memberTablesConfig.TI.IdFieldName + " as id, " + memberTablesConfig.TI.NGOFieldName + " as ngo, upper(" + memberTablesConfig.TI.NameFieldName + ") as name, 'TI' as type " +
        "from " + memberTablesConfig.TI.Schema + "." + memberTablesConfig.TI.TableName +
        " where unaccent(upper(" + memberTablesConfig.TI.NameFieldName + ")) like unaccent(upper(_SEARCH_))";

        var uceQuery = "select " + memberTablesConfig.UCE.IdFieldName + " as id, " + memberTablesConfig.UCE.NGOFieldName + " as ngo, upper(" + memberTablesConfig.UCE.NameFieldName + ") as name, 'UCE' as type " +
        "from " + memberTablesConfig.UCE.Schema + "." + memberTablesConfig.UCE.TableName +
        " where unaccent(upper(" + memberTablesConfig.UCE.NameFieldName + ")) like unaccent(upper(_SEARCH_))";

        var ucfQuery = "select " + memberTablesConfig.UCF.IdFieldName + " as id, " + memberTablesConfig.UCF.NGOFieldName + " as ngo, upper(" + memberTablesConfig.UCF.NameFieldName + ") as name, 'UCF' as type " +
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

          for(var i = 0, countriesArrayLength = countriesArray.length; i < countriesArrayLength; i++) {
            query += "$" + (parameter++) + ",";
            parameters.push(countriesArray[i]);
          }

          query = query.substring(0, (query.length - 1)) + ")";
        }

        if(states !== null) {
          var statesArray = states.split(',');
          query += " and " + memberTablesConfig.Cities.StateIdFieldName + " in (";

          for(var i = 0, statesArrayLength = statesArray.length; i < statesArrayLength; i++) {
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

  /**
   * Returns the names of the country, state and city for the given cities ids.
   * @param {object} pgPool - PostgreSQL connection pool
   * @param {array} ids - Cities ids
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getCountryStateAndCityNamesByCities
   * @memberof Filter
   * @inner
   */
  this.getCountryStateAndCityNamesByCities = function(pgPool, ids, callback) {
    // Connection with the PostgreSQL database
    pgPool.connect(function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "select name_0 as country, name_1 as state, name_2 as city from " + memberTablesConfig.Cities.Schema + "." + memberTablesConfig.Cities.TableName + " where " + memberTablesConfig.Cities.IdFieldName + " in (",
            params = [];

        for(var i = 0, idsLength = ids.length; i < idsLength; i++) {
          query += "$" + (i + 1) + ",";
          params.push(ids[i]);
        }

        query = query.substring(0, (query.length - 1)) + ") order by position(" + memberTablesConfig.Cities.IdFieldName + " in '" + ids.toString() + "');";

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

module.exports = Filter;
