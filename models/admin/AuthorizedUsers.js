"use strict";

/**
 * AuthorizedUsers model, which contains authorized users related database manipulations.
 * @class AuthorizedUsers
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberPath - 'path' module.
 * @property {json} memberTablesConfig - Tables configuration.
 * @property {object} memberPgPool - PostgreSQL connection pool.
 */
var AuthorizedUsers = function() {

  // 'path' module
  var memberPath = require('path');
  // Tables configuration
  var memberTablesConfig = require(memberPath.join(__dirname, '../../configurations/Tables.json'));
  // PostgreSQL connection pool
  var memberPgPool = require('../../pg');

  /**
   * Returns data of the authorized users table.
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function getAuthorizedUsers
   * @memberof AuthorizedUsers
   * @inner
   */
  this.getAuthorizedUsers = function(callback) {
    // Connection with the PostgreSQL database
    memberPgPool.connect(function(err, client, done) {
      if(!err) {
        // Creation of the query
        var query = "select * from " + memberTablesConfig.AuthorizedUsers.Schema + "." + memberTablesConfig.AuthorizedUsers.TableName + " order by " + memberTablesConfig.AuthorizedUsers.EmailFieldName + " asc;";

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
   * Inserts a given authorized user.
   * @param {string} email - User's email
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function insertAuthorizedUser
   * @memberof AuthorizedUsers
   * @inner
   */
  this.insertAuthorizedUser = function(email, callback) {
    // Connection with the PostgreSQL database
    memberPgPool.connect(function(err, client, done) {
      if(!err) {
        // Creation of the query
        var query = "insert into " + memberTablesConfig.AuthorizedUsers.Schema + "." + memberTablesConfig.AuthorizedUsers.TableName + " (" + memberTablesConfig.AuthorizedUsers.EmailFieldName + ") values ($1) returning id;";

        // Execution of the query
        client.query(query, [email], function(err, result) {
          done();
          if(!err) return callback(null, result);
          else return callback(err);
        });
      } else return callback(err);
    });
  };

  /**
   * Updates a given authorized user.
   * @param {integer} id - User's id
   * @param {string} email - User's email
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function updateAuthorizedUser
   * @memberof AuthorizedUsers
   * @inner
   */
  this.updateAuthorizedUser = function(id, email, callback) {
    // Connection with the PostgreSQL database
    memberPgPool.connect(function(err, client, done) {
      if(!err) {
        // Creation of the query
        var query = "update " + memberTablesConfig.AuthorizedUsers.Schema + "." + memberTablesConfig.AuthorizedUsers.TableName + " set " + memberTablesConfig.AuthorizedUsers.EmailFieldName + " = $1 where " + memberTablesConfig.AuthorizedUsers.IdFieldName + " = $2;";

        // Execution of the query
        client.query(query, [email, id], function(err, result) {
          done();
          if(!err) return callback(null, result);
          else return callback(err);
        });
      } else return callback(err);
    });
  };

  /**
   * Deletes a given authorized user.
   * @param {integer} id - User's id
   * @param {function} callback - Callback function
   * @returns {function} callback - Execution of the callback function, which will process the received data
   *
   * @function deleteAuthorizedUser
   * @memberof AuthorizedUsers
   * @inner
   */
  this.deleteAuthorizedUser = function(id, callback) {
    // Connection with the PostgreSQL database
    memberPgPool.connect(function(err, client, done) {
      if(!err) {
        // Creation of the query
        var query = "delete from " + memberTablesConfig.AuthorizedUsers.Schema + "." + memberTablesConfig.AuthorizedUsers.TableName + " where " + memberTablesConfig.AuthorizedUsers.IdFieldName + " = $1;";

        // Execution of the query
        client.query(query, [id], function(err, result) {
          done();
          if(!err) return callback(null, result);
          else return callback(err);
        });
      } else return callback(err);
    });
  };
};

module.exports = AuthorizedUsers;
