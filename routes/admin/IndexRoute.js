"use strict";

var passport = require('../../configurations/admin/Passport');

/**
 * Route of the Admin system index.
 * @class IndexRoute
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 */
var IndexRoute = function(app) {
  app.get('/admin', passport.isAuthenticated, function(request, response) {
    response.redirect(BASE_URL + 'admin/access-statistics');
  });
};

module.exports = IndexRoute;
