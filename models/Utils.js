"use strict";

/**
 * Utilities class of the BDQueimadas (server side).
 * @class Utils
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} self - Object that refers to the 'Utils' instance.
 * @property {object} memberPath - 'path' module.
 * @property {object} memberPgFormat - 'pg-format' module.
 * @property {object} memberFs - 'fs' module.
 * @property {json} memberTablesConfig - Tables configuration.
 */
var Utils = function() {

  // Object that refers to the 'Utils' instance
  var self = this;
  // 'path' module
  var memberPath = require('path');
  // 'pg-format' module
  var memberPgFormat = require('pg-format');
  // 'fs' module
  var memberFs = require('fs');
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

      if(options.specialRegions !== undefined) {
        var specialRegionsArray = options.specialRegions.split(',');
        query += " and (" + (options.tableAlias !== undefined ? options.tableAlias + "." : "") + memberTablesConfig.Fires.CountryFieldName + " in (select unnest(" + memberTablesConfig.SpecialRegions.CountriesFieldName + ") from " + memberTablesConfig.SpecialRegions.Schema + "." + memberTablesConfig.SpecialRegions.TableName + " where " + memberTablesConfig.SpecialRegions.IdFieldName + " in (";

        for(var i = 0, specialRegionsArrayLength = specialRegionsArray.length; i < specialRegionsArrayLength; i++) {
          if(options.pgFormatQuery !== undefined) query += "%L,";
          else query += "$" + (parameter++) + ",";
          params.push(specialRegionsArray[i]);
        }

        query = query.substring(0, (query.length - 1)) + "))";
      }

      query += (options.specialRegions !== undefined ? " or " : " and ") + (options.tableAlias !== undefined ? options.tableAlias + "." : "") + memberTablesConfig.Fires.CountryFieldName + " in (";

      for(var i = 0, countriesArrayLength = countriesArray.length; i < countriesArrayLength; i++) {
        if(options.pgFormatQuery !== undefined) query += "%L,";
        else query += "$" + (parameter++) + ",";
        params.push(countriesArray[i]);
      }

      query = query.substring(0, (query.length - 1)) + (options.specialRegions !== undefined ? "))" : ")");
    }

    var filterStates = (options.states !== undefined && (filterRules === undefined || filterRules === null || filterRules.ignoreStateFilter === undefined || !filterRules.ignoreStateFilter));
    var filterSpecialRegions = (options.specialRegions !== undefined);

    // If the 'options.states' parameter exists, a states 'where' clause is created
    // If the 'options.specialRegions' parameter exists, a specialRegions 'where' clause is created
    if(filterStates || filterSpecialRegions) {
      if(filterStates) {
        var statesArray = options.states.split(',');
        query += (filterSpecialRegions ? " and (" : " and ") + (options.tableAlias !== undefined ? options.tableAlias + "." : "") + memberTablesConfig.Fires.StateFieldName + " in (";

        for(var i = 0, statesArrayLength = statesArray.length; i < statesArrayLength; i++) {
          if(options.pgFormatQuery !== undefined) query += "%L,";
          else query += "$" + (parameter++) + ",";
          params.push(statesArray[i]);
        }

        query = query.substring(0, (query.length - 1)) + ")";
      }

      if(filterSpecialRegions) {
        var specialRegionsArray = options.specialRegions.split(',');
        query += (filterStates ? " or " : " and ") + (options.tableAlias !== undefined ? options.tableAlias + "." : "") + memberTablesConfig.Fires.SpecialRegionsFieldName + " && ARRAY[";

        for(var i = 0, specialRegionsArrayLength = specialRegionsArray.length; i < specialRegionsArrayLength; i++) {
          if(options.pgFormatQuery !== undefined) query += "%L,";
          else query += "$" + (parameter++) + ",";
          params.push(specialRegionsArray[i]);
        }

        query = query.substring(0, (query.length - 1)) + (filterStates ? "]::integer[])" : "]::integer[]");
      }
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
        var ngo = memberTablesConfig.UCE.NGOFieldName;
      } else if(options.protectedArea.type === 'UCF') {
        var schemaAndTable = memberTablesConfig.UCF.Schema + "." + memberTablesConfig.UCF.TableName;

        if(options.exportFilter !== undefined) {
          var schemaAndTable5Km = memberTablesConfig.UCF.Schema + "." + memberTablesConfig.UCF.TableName5KM;
          var schemaAndTable10Km = memberTablesConfig.UCF.Schema + "." + memberTablesConfig.UCF.TableName10KM;
        }

        var geom = memberTablesConfig.UCF.GeometryFieldName;
        var id = memberTablesConfig.UCF.IdFieldName;
        var ngo = memberTablesConfig.UCF.NGOFieldName;
      } else {
        var schemaAndTable = memberTablesConfig.TI.Schema + "." + memberTablesConfig.TI.TableName;

        if(options.exportFilter !== undefined) {
          var schemaAndTable5Km = memberTablesConfig.TI.Schema + "." + memberTablesConfig.TI.TableName5KM;
          var schemaAndTable10Km = memberTablesConfig.TI.Schema + "." + memberTablesConfig.TI.TableName10KM;
        }

        var geom = memberTablesConfig.TI.GeometryFieldName;
        var id = memberTablesConfig.TI.IdFieldName;
        var ngo = memberTablesConfig.TI.NGOFieldName;
      }

      if(options.exportFilter !== undefined) {
        if(!options.bufferInternal && options.bufferFive && options.bufferTen) {
          query += " and (ST_Intersects(" + memberTablesConfig.Fires.GeometryFieldName + ", (select " + geom + " from " + schemaAndTable10Km + " where concat(" + id + ", " + ngo + ") = " + (options.pgFormatQuery !== undefined ? "%L" : "$" + (parameter++)) + "))" +
              " and not ST_Intersects(" + memberTablesConfig.Fires.GeometryFieldName + ", (select " + geom + " from " + schemaAndTable + " where concat(" + id + ", " + ngo + ") = " + (options.pgFormatQuery !== undefined ? "%L" : "$" + (parameter++)) + ")))";
          params.push(options.protectedArea.id + options.protectedArea.ngo, options.protectedArea.id + options.protectedArea.ngo);
        } else if(options.bufferInternal && !options.bufferFive && options.bufferTen) {
          query += " and (ST_Intersects(" + memberTablesConfig.Fires.GeometryFieldName + ", (select " + geom + " from " + schemaAndTable + " where concat(" + id + ", " + ngo + ") = " + (options.pgFormatQuery !== undefined ? "%L" : "$" + (parameter++)) + "))" +
              " or (ST_Intersects(" + memberTablesConfig.Fires.GeometryFieldName + ", (select " + geom + " from " + schemaAndTable10Km + " where concat(" + id + ", " + ngo + ") = " + (options.pgFormatQuery !== undefined ? "%L" : "$" + (parameter++)) + "))" +
              " and not ST_Intersects(" + memberTablesConfig.Fires.GeometryFieldName + ", (select " + geom + " from " + schemaAndTable5Km + " where concat(" + id + ", " + ngo + ") = " + (options.pgFormatQuery !== undefined ? "%L" : "$" + (parameter++)) + "))))";
          params.push(options.protectedArea.id + options.protectedArea.ngo, options.protectedArea.id + options.protectedArea.ngo, options.protectedArea.id + options.protectedArea.ngo);
        } else if(options.bufferInternal && options.bufferFive && !options.bufferTen) {
          query += " and ST_Intersects(" + memberTablesConfig.Fires.GeometryFieldName + ", (select " + geom + " from " + schemaAndTable5Km + " where concat(" + id + ", " + ngo + ") = " + (options.pgFormatQuery !== undefined ? "%L" : "$" + (parameter++)) + "))";
          params.push(options.protectedArea.id + options.protectedArea.ngo);
        } else if(!options.bufferInternal && !options.bufferFive && options.bufferTen) {
          query += " and (ST_Intersects(" + memberTablesConfig.Fires.GeometryFieldName + ", (select " + geom + " from " + schemaAndTable10Km + " where concat(" + id + ", " + ngo + ") = " + (options.pgFormatQuery !== undefined ? "%L" : "$" + (parameter++)) + "))" +
              " and not ST_Intersects(" + memberTablesConfig.Fires.GeometryFieldName + ", (select " + geom + " from " + schemaAndTable5Km + " where concat(" + id + ", " + ngo + ") = " + (options.pgFormatQuery !== undefined ? "%L" : "$" + (parameter++)) + ")))";
          params.push(options.protectedArea.id + options.protectedArea.ngo, options.protectedArea.id + options.protectedArea.ngo);
        } else if(options.bufferInternal && !options.bufferFive && !options.bufferTen) {
          query += " and ST_Intersects(" + memberTablesConfig.Fires.GeometryFieldName + ", (select " + geom + " from " + schemaAndTable + " where concat(" + id + ", " + ngo + ") = " + (options.pgFormatQuery !== undefined ? "%L" : "$" + (parameter++)) + "))";
          params.push(options.protectedArea.id + options.protectedArea.ngo);
        } else if(!options.bufferInternal && options.bufferFive && !options.bufferTen) {
          query += " and (ST_Intersects(" + memberTablesConfig.Fires.GeometryFieldName + ", (select " + geom + " from " + schemaAndTable5Km + " where concat(" + id + ", " + ngo + ") = " + (options.pgFormatQuery !== undefined ? "%L" : "$" + (parameter++)) + "))" +
              " and not ST_Intersects(" + memberTablesConfig.Fires.GeometryFieldName + ", (select " + geom + " from " + schemaAndTable + " where concat(" + id + ", " + ngo + ") = " + (options.pgFormatQuery !== undefined ? "%L" : "$" + (parameter++)) + ")))";
          params.push(options.protectedArea.id + options.protectedArea.ngo, options.protectedArea.id + options.protectedArea.ngo);
        } else {
          query += " and ST_Intersects(" + memberTablesConfig.Fires.GeometryFieldName + ", (select " + geom + " from " + schemaAndTable10Km + " where concat(" + id + ", " + ngo + ") = " + (options.pgFormatQuery !== undefined ? "%L" : "$" + (parameter++)) + "))";
          params.push(options.protectedArea.id + options.protectedArea.ngo);
        }
      } else {
        query += " and ST_Intersects(" + (options.tableAlias !== undefined ? options.tableAlias + "." : "") + memberTablesConfig.Fires.GeometryFieldName + ", (select " + geom + " from " + schemaAndTable + " where concat(" + id + ", " + ngo + ") = " + (options.pgFormatQuery !== undefined ? "%L" : "$" + (parameter++)) + "))";
        params.push(options.protectedArea.id + options.protectedArea.ngo);
      }
    }

    // If the 'options.industrialFires' parameter exists, a industrial fires 'where' clause is created
    if(options.industrialFires !== undefined && (options.industrialFires == "false" || !options.industrialFires))
      query += " and " + (options.tableAlias !== undefined ? options.tableAlias + "." : "") + memberTablesConfig.Fires.IndustrialFiresFieldName + " is null";

    return {
      query: query,
      params: params,
      parameter: parameter
    };
  };

  
  /**
   * Verifies if a string exists in an array.
   * @param {array} array - Array where the search will be performed
   * @param {string} string - String to be searched
   * @returns {boolean} boolean - Flag that indicates if the string exists in the array
   *
   * @function stringInArray
   * @memberof Utils
   * @inner
   */
  this.stringInArray = function(array, string) {
    if(array !== null) {
      for(var i = 0, arrayLength = array.length; i < arrayLength; i++) {
        if(array[i].toString() === string.toString())
          return true;
      }
    }

    return false;
  };

  /**
   * Deletes a folder and all its content.
   * @param {string} path - Path to the folder
   *
   * @function deleteFolderRecursively
   * @memberof Utils
   * @inner
   */
  this.deleteFolderRecursively = function(path) {
    if(memberFs.existsSync(path)) {
      memberFs.readdirSync(path).forEach(function(file, index) {
        var currentPath = path + "/" + file;
        if(memberFs.lstatSync(currentPath).isDirectory()) {
          self.deleteFolderRecursively(currentPath);
        } else {
          memberFs.unlinkSync(currentPath);
        }
      });
      memberFs.rmdirSync(path);
    }
  };
};

module.exports = Utils;
