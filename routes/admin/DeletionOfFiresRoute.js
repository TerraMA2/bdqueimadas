"use strict";

var passport = require('../../configurations/admin/Passport');

/**
 * Route of the Admin system deletion of fires page.
 * @class DeletionOfFiresRoute
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 */
var DeletionOfFiresRoute = function(app) {
  var controller = app.controllers.admin.DeletionOfFiresController;

  app.get('/admin/deletion-of-fires', passport.isAuthenticated, controller.deletionOfFiresController);
  app.post('/admin/deletion-of-fires-confirmation', passport.isAuthenticated, controller.deletionOfFiresConfirmationController);
};

module.exports = DeletionOfFiresRoute;