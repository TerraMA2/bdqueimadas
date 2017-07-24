"use strict";

var passport = require('../../configurations/admin/Passport');

/**
 * Route of the Admin system.
 * @class AuthorizedUsersRoute
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 */
var AuthorizedUsersRoute = function(app) {
  var controller = app.controllers.admin.AuthorizedUsersController;

  app.get('/admin/users', passport.isAuthenticated, controller.authorizedUsersController);
  app.post('/users/add', passport.isAuthenticated, controller.addAuthorizedUser);
  app.post('/users/update', passport.isAuthenticated, controller.updateAuthorizedUser);
  app.post('/users/delete', passport.isAuthenticated, controller.deleteAuthorizedUser);
};

module.exports = AuthorizedUsersRoute;
