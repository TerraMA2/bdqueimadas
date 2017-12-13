"use strict";

/**
 * BasicSettings model, which contains basic settings related database manipulations.
 * @class BasicSettings
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberPath - 'path' module.
 * @property {json} memberTablesConfig - Tables configuration.
 * @property {object} memberPgPool - PostgreSQL connection pool.
 */
var BasicSettings = function() {

  // 'path' module
  var memberPath = require('path');
  // Tables configuration
  var memberTablesConfig = require(memberPath.join(__dirname, '../../configurations/Tables.json'));
  // PostgreSQL connection pool
  var memberPgPool = require('../../pg');

  /**
   * Returns the initial message data.
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getInitialMessageData
   * @memberof BasicSettings
   * @inner
   */
  this.getInitialMessageData = function(callback) {
    // Connection with the PostgreSQL database
    memberPgPool.connect(function(err, client, done) {
      if(!err) {
        // Creation of the query
        var query = "select " + memberTablesConfig.BasicSettings.InitialMessageFieldName + " as message, " + memberTablesConfig.BasicSettings.InitialMessageTimeFieldName + " as time from " + memberTablesConfig.BasicSettings.Schema + "." + memberTablesConfig.BasicSettings.TableName;

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
   * Sets the initial message data.
   * @param {string} message - New message
   * @param {integer} time - New duration time
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function setInitialMessageData
   * @memberof BasicSettings
   * @inner
   */
  this.setInitialMessageData = function(message, time, callback) {
    // Connection with the PostgreSQL database
    memberPgPool.connect(function(err, client, done) {
      if(!err) {
        // Creation of the query
        var query = "update " + memberTablesConfig.BasicSettings.Schema + "." + memberTablesConfig.BasicSettings.TableName + " set " + memberTablesConfig.BasicSettings.InitialMessageFieldName + " = $1, " + memberTablesConfig.BasicSettings.InitialMessageTimeFieldName + " = $2;",
            params = [message, time];

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

module.exports = BasicSettings;
