"use strict";

/**
 * Route of the system index.
 * @class IndexRoute
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 */
var IndexRoute = function(app) {
  var controller = app.controllers.IndexController;
  app.get('/', controller);

  var proxy = require('html2canvas-proxy');

  app.use('/proxy-html2canvas', proxy());
};

module.exports = IndexRoute;
