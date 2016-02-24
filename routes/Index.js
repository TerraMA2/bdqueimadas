"use strict";

/** @class IndexRoute - Route of the system index. */
module.exports = function(app) {
  var controller = app.controllers.Index;
  app.get('/', controller);
};
