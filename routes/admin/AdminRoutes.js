"use strict";

var passport = require('../../configurations/admin/Passport');
var memberAuthorizedUsers = new (require('../../models/admin/AuthorizedUsers.js'))();

/**
 * Route of the Admin system.
 * @class AdminRoutes
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 */
var AdminRoutes = function(app) {
  var getDonwloadsTableController = app.controllers.admin.GetDownloadsTableController;
  var usersController = app.controllers.admin.AuthorizedUsersController;

  app.get('/admin', passport.isAuthenticated, function(request, response) {
    response.redirect('/admin/downloads');
  });

  app.get('/admin/downloads', passport.isAuthenticated, function(request, response) {
    response.render('adminTemplate', { content: 'adminPages/downloads' });
  });

  app.get('/admin/users', passport.isAuthenticated, function(request, response) {

    memberAuthorizedUsers.getAuthorizedUsers(function(err, authorizedUsers) {
      if(err)
        return console.error(err);

      response.render('adminTemplate', { content: 'adminPages/users', authorizedUsers: authorizedUsers });
    });
  });

  app.post('/users/add', passport.isAuthenticated, usersController.addAuthorizedUser);

  app.post('/users/update', passport.isAuthenticated, usersController.updateAuthorizedUser);

  app.post('/users/delete', passport.isAuthenticated, usersController.deleteAuthorizedUser);

  app.post('/admin/get-downloads-table', passport.isAuthenticated, getDonwloadsTableController);
};

module.exports = AdminRoutes;
