TerraMA2WebComponents.obj.init(terrama2Path, ["MapDisplay", "LayerExplorer"]);

BDQueimadas.obj.init(configurations);

var terrama2Interval = window.setInterval(function() {
  if(TerraMA2WebComponents.obj.isComponentsLoaded()) {

    TerraMA2WebComponents.webcomponents.MapDisplay.addBaseLayers('bases', 'Camadas Bases');
    //TerraMA2WebComponents.webcomponents.MapDisplay.addCapabilitiesLayers('http://localhost:9095/geoserver/ows?service=WMS&request=getCapabilities', 'http://localhost:9095/geoserver/ows', 'geoserver', 'local', 'Local Server');

    TerraMA2WebComponents.webcomponents.MapDisplay.disableDoubleClickZoom();
    TerraMA2WebComponents.webcomponents.MapDisplay.addMousePosition();
    TerraMA2WebComponents.webcomponents.MapDisplay.addScale();

    clearInterval(terrama2Interval);
  }
}, 10);
