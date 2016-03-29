TerraMA2WebComponents.obj.init(terrama2Path, ["MapDisplay", "LayerExplorer"]);

BDQueimadas.obj.init(filterConfig, serverConfig, attributesTableConfig, componentsConfig, mapConfig);

var terrama2Interval = window.setInterval(function() {
  if(TerraMA2WebComponents.obj.isComponentsLoaded()) {

    TerraMA2WebComponents.webcomponents.MapDisplay.addBaseLayers('bases', 'Camadas Bases');
    TerraMA2WebComponents.webcomponents.MapDisplay.addCapabilitiesLayers(serverConfig.Servers.Local.URL + serverConfig.Servers.Local.CapabilitiesParams, serverConfig.Servers.Local.URL, 'geoserver', 'local', 'Local Server');

    clearInterval(terrama2Interval);
  }
}, 10);

var bdqueimadasInterval = window.setInterval(function() {
  if(BDQueimadas.obj.isComponentsLoaded()) {
    clearInterval(bdqueimadasInterval);
  }
}, 10);
