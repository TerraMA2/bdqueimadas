"use strict";

/**
 * Authorized users controller.
 * @class AuthorizedUsersController
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberAuthorizedUsers - 'AuthorizedUsers' model.
 */
var AuthorizedUsersController = function(app) {

  // 'AuthorizedUsers' model
  var memberAuthorizedUsers = new (require('../../models/admin/AuthorizedUsers.js'))();

  /**
   * Processes the request and returns a response.
   * @param {json} request - JSON containing the request data
   * @param {json} response - JSON containing the response data
   *
   * @function addAuthorizedUser
   * @memberof AuthorizedUsersController
   * @inner
   */
  var addAuthorizedUser = function(request, response) {
    memberAuthorizedUsers.insertAuthorizedUser(request.body.email, function(err, result) {
      if(err) return response.json({ error: err });

      response.json({ error: null, user: result });
    });
  };

  /**
   * Processes the request and returns a response.
   * @param {json} request - JSON containing the request data
   * @param {json} response - JSON containing the response data
   *
   * @function updateAuthorizedUser
   * @memberof AuthorizedUsersController
   * @inner
   */
  var updateAuthorizedUser = function(request, response) {
    memberAuthorizedUsers.updateAuthorizedUser(request.body.id, request.body.email, function(err, result) {
      if(err) return response.json({ error: err });

      response.json({ error: null });
    });
  };

  /**
   * Processes the request and returns a response.
   * @param {json} request - JSON containing the request data
   * @param {json} response - JSON containing the response data
   *
   * @function deleteAuthorizedUser
   * @memberof AuthorizedUsersController
   * @inner
   */
  var deleteAuthorizedUser = function(request, response) {
    memberAuthorizedUsers.deleteAuthorizedUser(request.body.id, function(err, result) {
      if(err) return response.json({ error: err });

      response.json({ error: null });
    });
  };

  return {
    addAuthorizedUser: addAuthorizedUser,
    updateAuthorizedUser: updateAuthorizedUser,
    deleteAuthorizedUser: deleteAuthorizedUser
  };
};

module.exports = AuthorizedUsersController;
