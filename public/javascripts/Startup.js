//$.blockUI({ message: '<h3>Inicializando o BDQueimadas...</h3>' });

requirejs.config({
  baseUrl: '/javascripts',
  paths: {
    'TerraMA2WC': '/externals/TerraMA2WebComponents/javascripts'
  }
});

requirejs(
  [
    'BDQueimadas',
    'components/Utils',
    'components/Filter',
    'components/AttributesTable',
    'components/Graphics',
    'components/Map',
    'TerraMA2WC/TerraMA2WebComponents',
    'TerraMA2WC/components/LayerExplorer.TerraMA2WebComponents',
    'TerraMA2WC/components/MapDisplay.TerraMA2WebComponents'
  ],
  function(BDQueimadas, Utils, Filter, AttributesTable, Graphics, Map, TerraMA2WebComponents, TerraMA2LayerExplorer, TerraMA2MapDisplay) {
    TerraMA2WebComponents.init();
    TerraMA2LayerExplorer.init();
    TerraMA2MapDisplay.init();

    if(TerraMA2MapDisplay.addBaseLayers('bases', 'Camadas Bases'))
      TerraMA2LayerExplorer.addLayersFromMap('bases', 'terrama2-layerexplorer');

    //TerraMA2MapDisplay.addCapabilitiesLayers('http://localhost:9095/geoserver/ows?service=WMS&request=getCapabilities', 'http://localhost:9095/geoserver/ows', 'geoserver', 'local', 'Local Server', function() {
    //  TerraMA2LayerExplorer.addLayersFromMap('local', 'terrama2-layerexplorer');
    //});

    TerraMA2MapDisplay.disableDoubleClickZoom();
    TerraMA2MapDisplay.addMousePosition();
    TerraMA2MapDisplay.addScale();

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
