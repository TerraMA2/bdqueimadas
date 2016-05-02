//$.blockUI({ message: '<h3>Inicializando o BDQueimadas...</h3>' });

requirejs.config({
  baseUrl: '/javascripts',
  paths: {
    TerraMA2WC: '/externals/TerraMA2WebComponents/javascripts'
  }
});

requirejs(
  [
    'BDQueimadas',
    'components/Utils',
    'components/Filter',
    'components/AttributesTable',
    'components/Graphics',
    'components/Map'
  ],
  function(BDQueimadas, Utils, Filter, AttributesTable, Graphics, Map) {
    TerraMA2WebComponents.LayerExplorer.init();
    TerraMA2WebComponents.MapDisplay.init();

    if(TerraMA2WebComponents.MapDisplay.addBaseLayers('bases', 'Camadas Bases'))
      TerraMA2WebComponents.LayerExplorer.addLayersFromMap('bases', 'terrama2-layerexplorer');

    //TerraMA2WebComponents.MapDisplay.addCapabilitiesLayers('http://localhost:9095/geoserver/ows?service=WMS&request=getCapabilities', 'http://localhost:9095/geoserver/ows', 'geoserver', 'local', 'Local Server', function() {
    //  TerraMA2WebComponents.LayerExplorer.addLayersFromMap('local', 'terrama2-layerexplorer');
    //});

    TerraMA2WebComponents.MapDisplay.disableDoubleClickZoom();
    TerraMA2WebComponents.MapDisplay.addMousePosition();
    TerraMA2WebComponents.MapDisplay.addScale();

    Utils.init(configurations);
    BDQueimadas.init();
    Filter.init();
    AttributesTable.init();
    Graphics.init();
    Map.init();

    BDQueimadas.updateComponents();
  }
);

$('#about-btn').on('click', function() {
  $('#about-dialog').dialog({
    width: 800,
    height: 900,
    modal: true,
    resizable: false,
    draggable: false,
    closeOnEscape: true,
    closeText: "",
    position: { my: 'top', at: 'top+15' }
  });
});
