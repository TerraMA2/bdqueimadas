"use strict";

/**
 * Route of the system index.
 * @class IndexRoute
 */
var IndexRoute = function(app) {
  var controller = app.controllers.IndexController;
  app.get('/', controller);
};

module.exports = IndexRoute;
