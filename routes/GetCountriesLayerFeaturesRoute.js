"use strict";

/**
 * Route of the GetCountriesLayerFeatures controller.
 * @class GetCountriesLayerFeaturesRoute
 */
var GetCountriesLayerFeaturesRoute = function(app) {
  var controller = app.controllers.GetCountriesLayerFeaturesController;
  app.get('/get-countries-layer-features', controller);
};

module.exports = GetCountriesLayerFeaturesRoute;
