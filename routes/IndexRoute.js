"use strict";

/** @class IndexRoute - Route of the system index. */
var IndexRoute = function(app) {
  var controller = app.controllers.IndexController;
  app.get('/', controller);
};

module.exports = IndexRoute;
