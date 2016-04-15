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

var bdqueimadasInterval = window.setInterval(function() {
  if(BDQueimadas.obj.isComponentsLoaded()) {

    BDQueimadas.obj.getSocket().emit('spatialFilterRequest', { id: "South America", text: "South America", key: 'Continent' });

    clearInterval(bdqueimadasInterval);
  }
}, 10);

$('#btnDialog').on('click', function() {
  $('#dialog').dialog({
    width: 800,
    height: 900,
    modal: true,
    resizable: false,
    draggable: false,
    closeOnEscape: true,
    title: 'Sobre',
    position: { my: 'top', at: 'top+15' }
  });
  $('.ui-dialog-titlebar-close').text('X');
});
