"use strict";

/**
 * Utilities class of the BDQueimadas (server side).
 * @class Utils
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberPath - 'path' module.
 * @property {object} memberPgFormat - 'pg-format' module.
 * @property {json} memberTablesConfig - Tables configuration.
 */
var Utils = function() {

  // 'path' module
  var memberPath = require('path');
  // 'pg-format' module
  var memberPgFormat = require('pg-format');
  // Tables configuration
  var memberTablesConfig = require(memberPath.join(__dirname, '../configurations/Tables.json'));

  /**
   * Creates and returns filters for the system queries.
   * @param {object} options - Filtering options
   * @param {string} query - Query
   * @param {array} params - Parameters array
   * @param {int} parameter - Parameters counter
   * @param {object} filterRules - Filter rules
   * @returns {object} {} - Object containing the query, the parameters array and the parameters counter
   *
   * @function getFilters
   * @memberof Utils
   * @inner
   */
  this.getFilters = function(options, query, params, parameter, filterRules) {
    // If the 'options.satellites' parameter exists, a satellites 'where' clause is created
    if(options.satellites !== undefined) {
      var satellitesArray = options.satellites.split(',');
      query += " and " + (options.tableAlias !== undefined ? options.tableAlias + "." : "") + memberTablesConfig.Fires.SatelliteFieldName + " in (";

      for(var i = 0, satellitesArrayLength = satellitesArray.length; i < satellitesArrayLength; i++) {
        if(options.pgFormatQuery !== undefined) query += "%L,";
        else query += "$" + (parameter++) + ",";
        params.push(satellitesArray[i]);
      }

      query = query.substring(0, (query.length - 1)) + ")";
    }

    // If the 'options.biomes' parameter exists, a biomes 'where' clause is created
    if(options.biomes !== undefined) {
      var biomesArray = options.biomes.split(',');
      query += " and " + (options.tableAlias !== undefined ? options.tableAlias + "." : "") + memberTablesConfig.Fires.BiomeFieldName + " in (";

      for(var i = 0, biomesArrayLength = biomesArray.length; i < biomesArrayLength; i++) {
        if(options.pgFormatQuery !== undefined) query += "%L,";
        else query += "$" + (parameter++) + ",";
        params.push(biomesArray[i]);
      }

      query = query.substring(0, (query.length - 1)) + ")";
    }

    // If the 'options.continent' parameter exists, a continent 'where' clause is created
    if(options.continent !== undefined) {
      query += " and " + (options.tableAlias !== undefined ? options.tableAlias + "." : "") + memberTablesConfig.Fires.ContinentFieldName + " = ";
      if(options.pgFormatQuery !== undefined) query += "%L";
      else query += "$" + (parameter++);
      params.push(options.continent);
    }

    // If the 'options.countries' parameter exists, a countries 'where' clause is created
    if(options.countries !== undefined && (filterRules === undefined || filterRules === null || filterRules.ignoreCountryFilter === undefined || !filterRules.ignoreCountryFilter)) {
      var countriesArray = options.countries.split(',');
      query += " and " + (options.tableAlias !== undefined ? options.tableAlias + "." : "") + memberTablesConfig.Fires.CountryFieldName + " in (";

      for(var i = 0, countriesArrayLength = countriesArray.length; i < countriesArrayLength; i++) {
        if(options.pgFormatQuery !== undefined) query += "%L,";
        else query += "$" + (parameter++) + ",";
        params.push(countriesArray[i]);
      }

      query = query.substring(0, (query.length - 1)) + ")";
    }

    // If the 'options.states' parameter exists, a states 'where' clause is created
    if(options.states !== undefined && (filterRules === undefined || filterRules === null || filterRules.ignoreStateFilter === undefined || !filterRules.ignoreStateFilter)) {
      var statesArray = options.states.split(',');
      query += " and " + (options.tableAlias !== undefined ? options.tableAlias + "." : "") + memberTablesConfig.Fires.StateFieldName + " in (";

      for(var i = 0, statesArrayLength = statesArray.length; i < statesArrayLength; i++) {
        if(options.pgFormatQuery !== undefined) query += "%L,";
        else query += "$" + (parameter++) + ",";
        params.push(statesArray[i]);
      }

      query = query.substring(0, (query.length - 1)) + ")";
    }

    // If the 'options.cities' parameter exists, a cities 'where' clause is created
    if(options.cities !== undefined && (filterRules === undefined || filterRules === null || filterRules.ignoreCityFilter === undefined || !filterRules.ignoreCityFilter)) {
      var citiesArray = options.cities.split(',');
      query += " and " + (options.tableAlias !== undefined ? options.tableAlias + "." : "") + memberTablesConfig.Fires.CityFieldName + " in (";

      for(var i = 0, citiesArrayLength = citiesArray.length; i < citiesArrayLength; i++) {
        if(options.pgFormatQuery !== undefined) query += "%L,";
        else query += "$" + (parameter++) + ",";
        params.push(citiesArray[i]);
      }

      query = query.substring(0, (query.length - 1)) + ")";
    }

    // If the 'options.extent' parameter exists, a extent 'where' clause is created
    if(options.extent !== undefined) {
      if(options.pgFormatQuery !== undefined) query += " and ST_Intersects(" + (options.tableAlias !== undefined ? options.tableAlias + "." : "") + memberTablesConfig.Fires.GeometryFieldName + ", ST_MakeEnvelope(%L, %L, %L, %L, 4326))";
      else query += " and ST_Intersects(" + (options.tableAlias !== undefined ? options.tableAlias + "." : "") + memberTablesConfig.Fires.GeometryFieldName + ", ST_MakeEnvelope($" + (parameter++) + ", $" + (parameter++) + ", $" + (parameter++) + ", $" + (parameter++) + ", 4326))";
      params.push(options.extent[0], options.extent[1], options.extent[2], options.extent[3]);
    }

    // If the 'options.risk' parameter exists, a risk 'where' clause is created
    if(options.risk !== undefined) {
      query += " and " + (options.tableAlias !== undefined ? options.tableAlias + "." : "") + memberTablesConfig.Fires.RiskFieldName;

      switch(options.risk) {
        case 'minimum':
          query +=  " between 0 and 0.15";
          break;
        case 'low':
          query += " between 0.15 and 0.4";
          break;
        case 'medium':
          query += " between 0.4 and 0.7";
          break;
        case 'high':
          query += " between 0.7 and 0.95";
          break;
        case 'critic':
          query += " > 0.95";
          break;
        default:
          query += " > 0";
          break;
      }
    }

    // If the 'options.protectedArea' parameter exists, a protected area 'where' clause is created
    if(options.protectedArea !== undefined) {
      if(options.protectedArea.type === 'UCE') {
        var schemaAndTable = memberTablesConfig.UCE.Schema + "." + memberTablesConfig.UCE.TableName;

        if(options.exportFilter !== undefined) {
          var schemaAndTable5Km = memberTablesConfig.UCE.Schema + "." + memberTablesConfig.UCE.TableName5KM;
          var schemaAndTable10Km = memberTablesConfig.UCE.Schema + "." + memberTablesConfig.UCE.TableName10KM;
        }

        var geom = memberTablesConfig.UCE.GeometryFieldName;
        var id = memberTablesConfig.UCE.IdFieldName;
      } else if(options.protectedArea.type === 'UCF') {
        var schemaAndTable = memberTablesConfig.UCF.Schema + "." + memberTablesConfig.UCF.TableName;

        if(options.exportFilter !== undefined) {
          var schemaAndTable5Km = memberTablesConfig.UCF.Schema + "." + memberTablesConfig.UCF.TableName5KM;
          var schemaAndTable10Km = memberTablesConfig.UCF.Schema + "." + memberTablesConfig.UCF.TableName10KM;
        }

        var geom = memberTablesConfig.UCF.GeometryFieldName;
        var id = memberTablesConfig.UCF.IdFieldName;
      } else {
        var schemaAndTable = memberTablesConfig.TI.Schema + "." + memberTablesConfig.TI.TableName;

        if(options.exportFilter !== undefined) {
          var schemaAndTable5Km = memberTablesConfig.TI.Schema + "." + memberTablesConfig.TI.TableName5KM;
          var schemaAndTable10Km = memberTablesConfig.TI.Schema + "." + memberTablesConfig.TI.TableName10KM;
        }

        var geom = memberTablesConfig.TI.GeometryFieldName;
        var id = memberTablesConfig.TI.IdFieldName;
      }

      if(options.exportFilter !== undefined) {
        if(!options.bufferInternal && options.bufferFive && options.bufferTen) {
          query += " and (ST_Intersects(" + memberTablesConfig.Fires.GeometryFieldName + ", (select " + geom + " from " + schemaAndTable10Km + " where " + id + " = " + (options.pgFormatQuery !== undefined ? "%L" : "$" + (parameter++)) + "))" +
              " and not ST_Intersects(" + memberTablesConfig.Fires.GeometryFieldName + ", (select " + geom + " from " + schemaAndTable + " where " + id + " = " + (options.pgFormatQuery !== undefined ? "%L" : "$" + (parameter++)) + ")))";
          params.push(options.protectedArea.id, options.protectedArea.id);
        } else if(options.bufferInternal && !options.bufferFive && options.bufferTen) {
          query += " and (ST_Intersects(" + memberTablesConfig.Fires.GeometryFieldName + ", (select " + geom + " from " + schemaAndTable + " where " + id + " = " + (options.pgFormatQuery !== undefined ? "%L" : "$" + (parameter++)) + "))" +
              " or (ST_Intersects(" + memberTablesConfig.Fires.GeometryFieldName + ", (select " + geom + " from " + schemaAndTable10Km + " where " + id + " = " + (options.pgFormatQuery !== undefined ? "%L" : "$" + (parameter++)) + "))" +
              " and not ST_Intersects(" + memberTablesConfig.Fires.GeometryFieldName + ", (select " + geom + " from " + schemaAndTable5Km + " where " + id + " = " + (options.pgFormatQuery !== undefined ? "%L" : "$" + (parameter++)) + "))))";
          params.push(options.protectedArea.id, options.protectedArea.id, options.protectedArea.id);
        } else if(options.bufferInternal && options.bufferFive && !options.bufferTen) {
          query += " and ST_Intersects(" + memberTablesConfig.Fires.GeometryFieldName + ", (select " + geom + " from " + schemaAndTable5Km + " where " + id + " = " + (options.pgFormatQuery !== undefined ? "%L" : "$" + (parameter++)) + "))";
          params.push(options.protectedArea.id);
        } else if(!options.bufferInternal && !options.bufferFive && options.bufferTen) {
          query += " and (ST_Intersects(" + memberTablesConfig.Fires.GeometryFieldName + ", (select " + geom + " from " + schemaAndTable10Km + " where " + id + " = " + (options.pgFormatQuery !== undefined ? "%L" : "$" + (parameter++)) + "))" +
              " and not ST_Intersects(" + memberTablesConfig.Fires.GeometryFieldName + ", (select " + geom + " from " + schemaAndTable5Km + " where " + id + " = " + (options.pgFormatQuery !== undefined ? "%L" : "$" + (parameter++)) + ")))";
          params.push(options.protectedArea.id, options.protectedArea.id);
        } else if(options.bufferInternal && !options.bufferFive && !options.bufferTen) {
          query += " and ST_Intersects(" + memberTablesConfig.Fires.GeometryFieldName + ", (select " + geom + " from " + schemaAndTable + " where " + id + " = " + (options.pgFormatQuery !== undefined ? "%L" : "$" + (parameter++)) + "))";
          params.push(options.protectedArea.id);
        } else if(!options.bufferInternal && options.bufferFive && !options.bufferTen) {
          query += " and (ST_Intersects(" + memberTablesConfig.Fires.GeometryFieldName + ", (select " + geom + " from " + schemaAndTable5Km + " where " + id + " = " + (options.pgFormatQuery !== undefined ? "%L" : "$" + (parameter++)) + "))" +
              " and not ST_Intersects(" + memberTablesConfig.Fires.GeometryFieldName + ", (select " + geom + " from " + schemaAndTable + " where " + id + " = " + (options.pgFormatQuery !== undefined ? "%L" : "$" + (parameter++)) + ")))";
          params.push(options.protectedArea.id, options.protectedArea.id);
        } else {
          query += " and ST_Intersects(" + memberTablesConfig.Fires.GeometryFieldName + ", (select " + geom + " from " + schemaAndTable10Km + " where " + id + " = " + (options.pgFormatQuery !== undefined ? "%L" : "$" + (parameter++)) + "))";
          params.push(options.protectedArea.id);
        }
      } else {
        query += " and ST_Intersects(" + (options.tableAlias !== undefined ? options.tableAlias + "." : "") + memberTablesConfig.Fires.GeometryFieldName + ", (select " + geom + " from " + schemaAndTable + " where " + id + " = " + (options.pgFormatQuery !== undefined ? "%L" : "$" + (parameter++)) + "))";
        params.push(options.protectedArea.id);
      }
    }

    return {
      query: query,
      params: params,
      parameter: parameter
    };
  };
};

module.exports = Utils;
