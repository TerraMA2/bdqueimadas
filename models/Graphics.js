"use strict";

/**
 * Graphics model, which contains graphics related database manipulations.
 * @class Graphics
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberPath - 'path' module.
 * @property {json} memberTablesConfig - Tables configuration.
 * @property {object} memberUtils - 'Utils' model.
 */
var Graphics = function() {

  // 'path' module
  var memberPath = require('path');
  // Tables configuration
  var memberTablesConfig = require(memberPath.join(__dirname, '../configurations/Tables.json'));
  // 'Utils' model
  var memberUtils = new (require('./Utils.js'))();

  /**
   * Callback of the database operations.
   * @callback Graphics~databaseOperationCallback
   * @param {error} err - Error
   * @param {json} result - Result of the operation
   */

  /**
   * Returns the count of the fires grouped by the received key.
   * @param {object} pgPool - PostgreSQL connection pool
   * @param {string} dateTimeFrom - Initial date / time
   * @param {string} dateTimeTo - Final date / time
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
  this.getFiresCount = function(pgPool, dateTimeFrom, dateTimeTo, key, filterRules, options, callback) {
    // Counter of the query parameters
    var parameter = 1;

    // Connection with the PostgreSQL database
    pgPool.connect(function(err, client, done) {
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
        var query = "select " + fields + " from " + memberTablesConfig.Fires.Schema + "." + memberTablesConfig.Fires.TableName + " where (" + memberTablesConfig.Fires.DateTimeFieldName + " between $" + (parameter++) + " and $" + (parameter++) + ")",
            params = [dateTimeFrom, dateTimeTo];

        var getFiltersResult = memberUtils.getFilters(options, query, params, parameter, filterRules);

        query = getFiltersResult.query;
        params = getFiltersResult.params;
        parameter = getFiltersResult.parameter;

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
   * @param {object} pgPool - PostgreSQL connection pool
   * @param {string} dateTimeFrom - Initial date / time
   * @param {string} dateTimeTo - Final date / time
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
  this.getFiresCountByPA = function(pgPool, dateTimeFrom, dateTimeTo, key, filterRules, options, callback) {
    // Counter of the query parameters
    var parameter = 1;

    // Connection with the PostgreSQL database
    pgPool.connect(function(err, client, done) {
      if(!err) {
        if(key === "UCE" || key === "UCE_5KM" || key === "UCE_10KM") {
          var fields = "b." + memberTablesConfig.UCE.NameFieldName + " as name, count(c.*) as count";
          var group = "b." + memberTablesConfig.UCE.NameFieldName;
          var tableFires = memberTablesConfig.UCE.FiresSchema + "." + memberTablesConfig.UCE.FiresTableName + " a";
          var tablePA = memberTablesConfig.UCE.Schema + "." + memberTablesConfig.UCE.TableName + " b";
          var idField = "b." + memberTablesConfig.UCE.IdFieldName;
          var ngoField = "b." + memberTablesConfig.UCE.NGOFieldName;
          var PAField = "a." + memberTablesConfig.UCE.FiresPAFieldName;
          var ngoPAField = "a." + memberTablesConfig.UCE.NGOFieldName;
          var firesIdsField = "a." + memberTablesConfig.UCE.FiresIdsFieldName;
          var dateField = "a." + memberTablesConfig.UCE.FiresDateFieldName;
          var optionalWhere = " " + memberTablesConfig.UCE.IsFederal + "=false and";
        } else if(key === "UCF" || key === "UCF_5KM" || key === "UCF_10KM") {
          var fields = "b." + memberTablesConfig.UCF.NameFieldName + " as name, count(c.*) as count";
          var group = "b." + memberTablesConfig.UCF.NameFieldName;
          var tableFires = memberTablesConfig.UCF.FiresSchema + "." + memberTablesConfig.UCF.FiresTableName + " a";
          var tablePA = memberTablesConfig.UCF.Schema + "." + memberTablesConfig.UCF.TableName + " b";
          var idField = "b." + memberTablesConfig.UCF.IdFieldName;
          var ngoField = "b." + memberTablesConfig.UCF.NGOFieldName;
          var PAField = "a." + memberTablesConfig.UCF.FiresPAFieldName;
          var ngoPAField = "a." + memberTablesConfig.UCF.NGOFieldName;
          var firesIdsField = "a." + memberTablesConfig.UCF.FiresIdsFieldName;
          var dateField = "a." + memberTablesConfig.UCF.FiresDateFieldName;
          var optionalWhere = " " + memberTablesConfig.UCF.IsFederal + "=true and";
        } else {
          var fields = "b." + memberTablesConfig.TI.NameFieldName + " as name, count(c.*) as count";
          var group = "b." + memberTablesConfig.TI.NameFieldName;
          var tableFires = memberTablesConfig.TI.FiresSchema + "." + memberTablesConfig.TI.FiresTableName + " a";
          var tablePA = memberTablesConfig.TI.Schema + "." + memberTablesConfig.TI.TableName + " b";
          var idField = "b." + memberTablesConfig.TI.IdFieldName;
          var ngoField = "b." + memberTablesConfig.TI.NGOFieldName;
          var PAField = "a." + memberTablesConfig.TI.FiresPAFieldName;
          var ngoPAField = "a." + memberTablesConfig.TI.NGOFieldName;
          var firesIdsField = "a." + memberTablesConfig.TI.FiresIdsFieldName;
          var dateField = "a." + memberTablesConfig.TI.FiresDateFieldName;
          var optionalWhere = "";
        }

        if(key === "UCE_5KM") {
          tableFires = memberTablesConfig.UCE.FiresSchema + "." + memberTablesConfig.UCE.Fires5KMTableName + " a";
          PAField = "a." + memberTablesConfig.UCE.Fires5KMPAFieldName;
        } else if(key === "UCE_10KM") {
          tableFires = memberTablesConfig.UCE.FiresSchema + "." + memberTablesConfig.UCE.Fires10KMTableName + " a";
          PAField = "a." + memberTablesConfig.UCE.Fires10KMPAFieldName;
        } else if(key === "UCF_5KM") {
          tableFires = memberTablesConfig.UCF.FiresSchema + "." + memberTablesConfig.UCF.Fires5KMTableName + " a";
          PAField = "a." + memberTablesConfig.UCF.Fires5KMPAFieldName;
        } else if(key === "UCF_10KM") {
          tableFires = memberTablesConfig.UCF.FiresSchema + "." + memberTablesConfig.UCF.Fires10KMTableName + " a";
          PAField = "a." + memberTablesConfig.UCF.Fires10KMPAFieldName;
        } else if(key === "TI_5KM") {
          tableFires = memberTablesConfig.TI.FiresSchema + "." + memberTablesConfig.TI.Fires5KMTableName + " a";
          PAField = "a." + memberTablesConfig.TI.Fires5KMPAFieldName;
        } else if(key === "TI_10KM") {
          tableFires = memberTablesConfig.TI.FiresSchema + "." + memberTablesConfig.TI.Fires10KMTableName + " a";
          PAField = "a." + memberTablesConfig.TI.Fires10KMPAFieldName;
        }

        // Creation of the query
        var query = "select " + fields + " from " + tableFires +
        " inner join " + tablePA + " on (concat(" + ngoField + ", " + idField + ") = concat(" + ngoPAField + ", " + PAField + "))" +
        " inner join " + memberTablesConfig.Fires.Schema + "." + memberTablesConfig.Fires.TableName +
        " c on (c." + memberTablesConfig.Fires.IdFieldName + " = ANY (" + firesIdsField + "))" +
        " where" + optionalWhere +
        " (c." + memberTablesConfig.Fires.DateTimeFieldName + " between $" + (parameter++) + " and $" + (parameter++) + ")" +
        " and (" + dateField + " between $" + (parameter++) + " and $" + (parameter++) + ")",
            params = [dateTimeFrom, dateTimeTo, dateTimeFrom, dateTimeTo];

        options.tableAlias = "c";

        var getFiltersResult = memberUtils.getFilters(options, query, params, parameter, filterRules);

        query = getFiltersResult.query;
        params = getFiltersResult.params;
        parameter = getFiltersResult.parameter;

        query += " group by " + group + " order by count desc, " + group + " asc";

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
   * @param {object} pgPool - PostgreSQL connection pool
   * @param {string} dateTimeFrom - Initial date / time
   * @param {string} dateTimeTo - Final date / time
   * @param {json} filterRules - Filter rules
   * @param {json} options - Filtering options
   * @param {databaseOperationCallback} callback - Callback function
   * @returns {databaseOperationCallback} callback - Execution of the callback function, which will process the received data
   *
   * @function getFiresTotalCount
   * @memberof Graphics
   * @inner
   */
  this.getFiresTotalCount = function(pgPool, dateTimeFrom, dateTimeTo, filterRules, options, callback) {
    // Counter of the query parameters
    var parameter = 1;

    // Connection with the PostgreSQL database
    pgPool.connect(function(err, client, done) {
      if(!err) {

        // Creation of the query
        var query = "select count(*) as count from " + memberTablesConfig.Fires.Schema + "." + memberTablesConfig.Fires.TableName + " where (" + memberTablesConfig.Fires.DateTimeFieldName + " between $" + (parameter++) + " and $" + (parameter++) + ")",
            params = [dateTimeFrom, dateTimeTo];

        var getFiltersResult = memberUtils.getFilters(options, query, params, parameter, filterRules);

        query = getFiltersResult.query;
        params = getFiltersResult.params;
        parameter = getFiltersResult.parameter;

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
   * @param {object} pgPool - PostgreSQL connection pool
   * @param {string} dateTimeFrom - Initial date / time
   * @param {string} dateTimeTo - Final date / time
   * @param {json} filterRules - Filter rules
   * @param {json} options - Filtering options
   * @param {databaseOperationCallback} callback - Callback function
   * @returns {databaseOperationCallback} callback - Execution of the callback function, which will process the received data
   *
   * @function getFiresCountByWeek
   * @memberof Graphics
   * @inner
   */
  this.getFiresCountByWeek = function(pgPool, dateTimeFrom, dateTimeTo, filterRules, options, callback) {
    // Counter of the query parameters
    var parameter = 1;

    // Connection with the PostgreSQL database
    pgPool.connect(function(err, client, done) {
      if(!err) {
        // Creation of the query
        var query = "select TO_CHAR(date_trunc('week', " + memberTablesConfig.Fires.DateTimeFieldName + ")::date, 'YYYY/MM/DD') as start, " +
        "TO_CHAR((date_trunc('week', " + memberTablesConfig.Fires.DateTimeFieldName + ") + '6 days')::date, 'YYYY/MM/DD') as end, count(*) AS count " +
        "from " + memberTablesConfig.Fires.Schema + "." + memberTablesConfig.Fires.TableName +
        " where (" + memberTablesConfig.Fires.DateTimeFieldName + " between $" + (parameter++) + " and $" + (parameter++) + ")",
            params = [dateTimeFrom, dateTimeTo];

        var getFiltersResult = memberUtils.getFilters(options, query, params, parameter, filterRules);

        query = getFiltersResult.query;
        params = getFiltersResult.params;
        parameter = getFiltersResult.parameter;

        query += " group by 1, 2 order by 1, 2";

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
