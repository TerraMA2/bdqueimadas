"use strict";

var passport = require('../../configurations/admin/Passport');

/**
 * Route of the Admin system.
 * @class IndexRoute
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 */
var IndexRoute = function(app) {
  var getDonwloadsTableController = app.controllers.admin.GetDownloadsTableController;

  app.get('/admin', passport.isAuthenticated, function(request, response) {
    response.redirect('/admin/downloads');
  });

  app.get('/admin/downloads', passport.isAuthenticated, function(request, response) {
    response.render('adminTemplate', { content: 'adminPages/downloads', mainTitle: 'Downloads' });
  });

  app.post('/admin/get-downloads-table', passport.isAuthenticated, getDonwloadsTableController);
};

module.exports = IndexRoute;
