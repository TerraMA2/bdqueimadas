"use strict";

var passport = require('../../configurations/admin/Passport');

/**
 * Route of the Admin system basic settings.
 * @class BasicSettingsRoute
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 */
var BasicSettingsRoute = function(app) {
  var controller = app.controllers.admin.BasicSettingsController;

  app.get('/admin/basic-settings', passport.isAuthenticated, controller.basicSettingsController);
  app.post('/admin/update-basic-settings', passport.isAuthenticated, controller.updateBasicSettings);
};

module.exports = BasicSettingsRoute;