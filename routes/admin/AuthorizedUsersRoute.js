"use strict";

var passport = require('../../configurations/admin/Passport');

/**
 * Route of the Admin system authorized users.
 * @class AuthorizedUsersRoute
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 */
var AuthorizedUsersRoute = function(app) {
  var controller = app.controllers.admin.AuthorizedUsersController;

  app.get('/admin/users', passport.isAuthenticated, controller.authorizedUsersController);
  app.post('/admin/users/add', passport.isAuthenticated, controller.addAuthorizedUser);
  app.post('/admin/users/update', passport.isAuthenticated, controller.updateAuthorizedUser);
  app.post('/admin/users/delete', passport.isAuthenticated, controller.deleteAuthorizedUser);
};

module.exports = AuthorizedUsersRoute;
