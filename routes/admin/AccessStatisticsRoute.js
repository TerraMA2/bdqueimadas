"use strict";

var passport = require('../../configurations/admin/Passport');

/**
 * Route of the Admin system access statistics.
 * @class AccessStatisticsRoute
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 */
var AccessStatisticsRoute = function(app) {
  var controller = app.controllers.admin.AccessStatisticsController;

  app.get('/admin/access-statistics', passport.isAuthenticated, controller.accessStatisticsController);
};

module.exports = AccessStatisticsRoute;
