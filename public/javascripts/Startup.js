requirejs.config({
  baseUrl: BASE_URL + 'javascripts',
  paths: {
    TerraMA2WebComponents: BASE_URL + 'externals/TerraMA2WebComponents/TerraMA2WebComponents.min'
  }
});

requirejs(
  ['BDQueimadas', 'components/Utils', 'components/Filter', 'components/AttributesTable', 'components/Graphics', 'components/Map', 'TerraMA2WebComponents'],
  function(BDQueimadas, Utils, Filter, AttributesTable, Graphics, Map, TerraMA2WebComponents) {
    TerraMA2WebComponents.LayerExplorer.init();
    TerraMA2WebComponents.MapDisplay.init();

    //if(TerraMA2WebComponents.MapDisplay.addOSMLayer('osm', 'OpenStreetMap', false, 'terrama2-layerexplorer'))
      //TerraMA2WebComponents.LayerExplorer.addLayersFromMap('osm', 'terrama2-layerexplorer');

    //if(TerraMA2WebComponents.MapDisplay.addMapQuestSatelliteLayer('mqt', 'MapQuest', true, 'terrama2-layerexplorer'))
      //TerraMA2WebComponents.LayerExplorer.addLayersFromMap('mqt', 'terrama2-layerexplorer');

    Utils.init(configurations, BASE_URL);
    BDQueimadas.init();
    Filter.init();
    AttributesTable.init();
    Graphics.init();
    Map.init();

    Filter.applyFilter();
    $.event.trigger({type: "updateComponents"});
  }
);
