"use strict";

/**
 * Route of the WMS proxy controller.
 * @class ProxyWMSRoute
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 */
var ProxyWMSRoute = function(app) {
  var controller = app.controllers.ProxyWMS;
  app.get('/wms-proxy', controller);
};

module.exports = ProxyWMSRoute;
