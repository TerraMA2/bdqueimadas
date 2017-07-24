"use strict";

var passport = require('../../configurations/admin/Passport');

/**
 * Route of the Admin system index.
 * @class IndexRoute
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 */
var IndexRoute = function(app) {
  var controller = app.controllers.admin.DownloadsController;

  app.get('/admin/downloads', passport.isAuthenticated, controller.downloadsController);
  app.post('/admin/get-downloads-table', passport.isAuthenticated, controller.getDownloadsTable);
};

module.exports = IndexRoute;
