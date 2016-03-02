"use strict";

/**
 * Filter model, which contains filter related database manipulations.
 * @class Filter
 *
 * @property {object} path - 'path' module.
 * @property {object} pgConnectionString - 'PgConnectionString' module.
 * @property {json} attributesTableConfig - Attributes table configuration.
 * @property {json} filterConfig - Filter configuration.
 * @property {object} pg - 'pg' module.
 */
var Filter = function() {

  // 'path' module
  var path = require('path');
  // 'PgConnectionString' module
  var pgConnectionString = new (require(path.join(__dirname, '../modules/PgConnectionString.js')))();
  // Attributes table configuration
  var attributesTableConfig = require(path.join(__dirname, '../configurations/AttributesTable.json'));
  // Filter configuration
  var filterConfig = require(path.join(__dirname, '../configurations/Filter.json'));
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
    pg.connect(pgConnectionString.getConnectionString(), function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "select ST_AsText(ST_Centroid(geom)) from " + pgConnectionString.getSchema() + "." + filterConfig.SpatialFilter.Countries.TableName + " where " + filterConfig.SpatialFilter.Countries.IdFieldName + " = $1;",
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
    pg.connect(pgConnectionString.getConnectionString(), function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "select ST_AsText(ST_Centroid(geom)) from " + pgConnectionString.getSchema() + "." + filterConfig.SpatialFilter.States.TableName + " where " + filterConfig.SpatialFilter.States.IdFieldName + " = $1;",
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
    pg.connect(pgConnectionString.getConnectionString(), function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "select distinct " + filterConfig.SpatialFilter.Continents.IdFieldName + " as id, " + filterConfig.SpatialFilter.Continents.NameFieldName + " as name from " + pgConnectionString.getSchema() + "." + filterConfig.SpatialFilter.Continents.TableName + " order by " +
        filterConfig.SpatialFilter.Continents.NameFieldName + " asc;";

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
    pg.connect(pgConnectionString.getConnectionString(), function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "select " + filterConfig.SpatialFilter.Countries.IdFieldName + " as id, " + filterConfig.SpatialFilter.Countries.NameFieldName + " as name from " + pgConnectionString.getSchema() + "." + filterConfig.SpatialFilter.Countries.TableName + " where " + filterConfig.SpatialFilter.Continents.IdFieldName + " = $1 order by " + filterConfig.SpatialFilter.Countries.NameFieldName + " asc;",
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
    pg.connect(pgConnectionString.getConnectionString(), function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "select " + filterConfig.SpatialFilter.States.IdFieldName + " as id, " + filterConfig.SpatialFilter.States.NameFieldName + " as name from " + pgConnectionString.getSchema() + "." + filterConfig.SpatialFilter.States.TableName + " where " + filterConfig.SpatialFilter.Countries.IdFieldName + " = $1 order by " + filterConfig.SpatialFilter.States.NameFieldName + " asc;",
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
    pg.connect(pgConnectionString.getConnectionString(), function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "select ST_Extent(geom) as extent from " + pgConnectionString.getSchema() + "." + filterConfig.SpatialFilter.Continents.TableName + " where " + filterConfig.SpatialFilter.Continents.IdFieldName + " = $1;",
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
    pg.connect(pgConnectionString.getConnectionString(), function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "select ST_Extent(geom) as extent from " + pgConnectionString.getSchema() + "." + filterConfig.SpatialFilter.Countries.TableName + " where " + filterConfig.SpatialFilter.Countries.IdFieldName + " = $1;",
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
    pg.connect(pgConnectionString.getConnectionString(), function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "select ST_Extent(geom) as extent from " + pgConnectionString.getSchema() + "." + filterConfig.SpatialFilter.States.TableName + " where " + filterConfig.SpatialFilter.States.IdFieldName + " = $1;",
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
    pg.connect(pgConnectionString.getConnectionString(), function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "select count(*) as firescount from " + pgConnectionString.getSchema() + ".focos where pais = $1;",
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
};

module.exports = Filter;
