//$.blockUI({ message: '<h3>Inicializando o BDQueimadas...</h3>' });

requirejs.config({
  baseUrl: '/javascripts'
});

requirejs(
  ['BDQueimadas', 'components/Utils', 'components/Filter', 'components/AttributesTable', 'components/Graphics', 'components/Map'],
  function(BDQueimadas, Utils, Filter, AttributesTable, Graphics, Map) {

    TerraMA2WebComponents.obj.init(terrama2Path, ["MapDisplay", "LayerExplorer"], function() {
      TerraMA2WebComponents.webcomponents.MapDisplay.addBaseLayers('bases', 'Camadas Bases');
      //TerraMA2WebComponents.webcomponents.MapDisplay.addCapabilitiesLayers('http://localhost:9095/geoserver/ows?service=WMS&request=getCapabilities', 'http://localhost:9095/geoserver/ows', 'geoserver', 'local', 'Local Server');

      TerraMA2WebComponents.webcomponents.MapDisplay.disableDoubleClickZoom();
      TerraMA2WebComponents.webcomponents.MapDisplay.addMousePosition();
      TerraMA2WebComponents.webcomponents.MapDisplay.addScale();



      Utils.init(configurations);

      BDQueimadas.init();
      Filter.init();
      AttributesTable.init();
      Graphics.init();
      Map.init();

      BDQueimadas.updateComponents();
    });
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
