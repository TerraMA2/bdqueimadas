"use strict";

/**
 * Filter model, which contains filter related database manipulations.
 * @class Filter
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberPath - 'path' module.
 * @property {object} memberPgConnectionString - 'PgConnectionString' module.
 * @property {json} memberFilterConfig - Filter configuration.
 * @property {object} memberPg - 'pg' module.
 */
var Filter = function() {

  // 'path' module
  var memberPath = require('path');
  // 'PgConnectionString' module
  var memberPgConnectionString = new (require(memberPath.join(__dirname, '../modules/PgConnectionString.js')))();
  // Filter configuration
  var memberFilterConfig = require(memberPath.join(__dirname, '../configurations/Filter.json'));
  // 'pg' module
  var memberPg = require('pg');

  /**
   * Returns the center cordinates of the country correspondent to the received id.
   * @param {number} countryId - Country id
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getCountryCenter
   * @memberof Filter
   * @inner
   */
  this.getCountryCenter = function(countryId, callback) {
    // Connection with the PostgreSQL database
    memberPg.connect(memberPgConnectionString.getConnectionString(), function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "select ST_AsText(ST_Centroid(" + memberFilterConfig.SpatialFilter.Countries.GeometryFieldName + ")) from " + memberPgConnectionString.getSchema() + "." + memberFilterConfig.SpatialFilter.Countries.TableName + " where " + memberFilterConfig.SpatialFilter.Countries.IdFieldName + " = $1;",
            params = [countryId];

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
   * Returns the center cordinates of the state correspondent to the received id.
   * @param {number} stateId - State id
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getStateCenter
   * @memberof Filter
   * @inner
   */
  this.getStateCenter = function(stateId, callback) {
    // Connection with the PostgreSQL database
    memberPg.connect(memberPgConnectionString.getConnectionString(), function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "select ST_AsText(ST_Centroid(" + memberFilterConfig.SpatialFilter.States.GeometryFieldName + ")) from " + memberPgConnectionString.getSchema() + "." + memberFilterConfig.SpatialFilter.States.TableName + " where " + memberFilterConfig.SpatialFilter.States.IdFieldName + " = $1;",
            params = [stateId];

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
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getContinents
   * @memberof Filter
   * @inner
   */
  this.getContinents = function(callback) {
    // Connection with the PostgreSQL database
    memberPg.connect(memberPgConnectionString.getConnectionString(), function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "select distinct " + memberFilterConfig.SpatialFilter.Continents.IdFieldName + " as id, " + memberFilterConfig.SpatialFilter.Continents.NameFieldName + " as name from " + memberPgConnectionString.getSchema() + "." + memberFilterConfig.SpatialFilter.Continents.TableName + " order by " +
        memberFilterConfig.SpatialFilter.Continents.NameFieldName + " asc;";

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
   * Returns a list of countries filtered by the received continent id.
   * @param {string} continent - Continent id
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getCountriesByContinent
   * @memberof Filter
   * @inner
   */
  this.getCountriesByContinent = function(continent, callback) {
    // Connection with the PostgreSQL database
    memberPg.connect(memberPgConnectionString.getConnectionString(), function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "select " + memberFilterConfig.SpatialFilter.Countries.IdFieldName + " as id, " + memberFilterConfig.SpatialFilter.Countries.NameFieldName + " as name from " + memberPgConnectionString.getSchema() + "." + memberFilterConfig.SpatialFilter.Countries.TableName + " where " + memberFilterConfig.SpatialFilter.Continents.IdFieldName + " = $1 order by " + memberFilterConfig.SpatialFilter.Countries.NameFieldName + " asc;",
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
   * @param {number} country - Country id
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getStatesByCountry
   * @memberof Filter
   * @inner
   */
  this.getStatesByCountry = function(country, callback) {
    // Connection with the PostgreSQL database
    memberPg.connect(memberPgConnectionString.getConnectionString(), function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "select " + memberFilterConfig.SpatialFilter.States.IdFieldName + " as id, " + memberFilterConfig.SpatialFilter.States.NameFieldName + " as name from " + memberPgConnectionString.getSchema() + "." + memberFilterConfig.SpatialFilter.States.TableName + " where " + memberFilterConfig.SpatialFilter.Countries.IdFieldName + " = $1 order by " + memberFilterConfig.SpatialFilter.States.NameFieldName + " asc;",
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
   * @param {number} continent - Continent id
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getContinentExtent
   * @memberof Filter
   * @inner
   */
  this.getContinentExtent = function(continent, callback) {
    // Connection with the PostgreSQL database
    memberPg.connect(memberPgConnectionString.getConnectionString(), function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "select ST_Extent(" + memberFilterConfig.SpatialFilter.Continents.GeometryFieldName + ") as extent from " + memberPgConnectionString.getSchema() + "." + memberFilterConfig.SpatialFilter.Continents.TableName + " where " + memberFilterConfig.SpatialFilter.Continents.IdFieldName + " = $1;",
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
   * Returns the country extent correspondent to the received id.
   * @param {number} country - Country id
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getCountryExtent
   * @memberof Filter
   * @inner
   */
  this.getCountryExtent = function(country, callback) {
    // Connection with the PostgreSQL database
    memberPg.connect(memberPgConnectionString.getConnectionString(), function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "select ST_Extent(" + memberFilterConfig.SpatialFilter.Countries.GeometryFieldName + ") as extent from " + memberPgConnectionString.getSchema() + "." + memberFilterConfig.SpatialFilter.Countries.TableName + " where " + memberFilterConfig.SpatialFilter.Countries.IdFieldName + " = $1;",
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
   * Returns the state extent correspondent to the received id.
   * @param {number} state - State id
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getStateExtent
   * @memberof Filter
   * @inner
   */
  this.getStateExtent = function(state, callback) {
    // Connection with the PostgreSQL database
    memberPg.connect(memberPgConnectionString.getConnectionString(), function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "select ST_Extent(" + memberFilterConfig.SpatialFilter.States.GeometryFieldName + ") as extent from " + memberPgConnectionString.getSchema() + "." + memberFilterConfig.SpatialFilter.States.TableName + " where " + memberFilterConfig.SpatialFilter.States.IdFieldName + " = $1;",
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
   * Returns the number of the fires located in the country correspondent to the received id.
   * @param {number} country - Country id
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getFiresCountByCountry
   * @memberof Filter
   * @inner
   */
  this.getFiresCountByCountry = function(country, callback) {
    // Connection with the PostgreSQL database
    memberPg.connect(memberPgConnectionString.getConnectionString(), function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "select count(*) as firescount from " + memberPgConnectionString.getSchema() + ".focos where pais = $1;",
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
   * Returns the extent of the polygon that intersects with the received point.
   * @param {string} longitude - Longitude of the point
   * @param {string} latitude - Latitude of the point
   * @param {float} resolution - Current map resolution
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getExtentByIntersection
   * @memberof Filter
   * @inner
   */
  this.getExtentByIntersection = function(longitude, latitude, resolution, callback) {
    // Connection with the PostgreSQL database
    memberPg.connect(memberPgConnectionString.getConnectionString(), function(err, client, done) {
      if(!err) {

        var key = "States";

        if(resolution >= memberFilterConfig.SpatialFilter.Continents.DoubleclickMinimumResolution)
          key = "Continents";
        else if(resolution >= memberFilterConfig.SpatialFilter.Countries.DoubleclickMinimumResolution && resolution < memberFilterConfig.SpatialFilter.Countries.DoubleclickMaximumResolution)
          key = "Countries";

        // Creation of the query
        var query = "SELECT ST_Extent(" + memberFilterConfig.SpatialFilter[key].GeometryFieldName + ") as extent FROM " + memberPgConnectionString.getSchema() + "." + memberFilterConfig.SpatialFilter[key].TableName + " WHERE ST_Intersects(" + memberFilterConfig.SpatialFilter[key].GeometryFieldName + ", ST_SetSRID(ST_MakePoint($1, $2), 4326));",
            params = [longitude, latitude];

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
