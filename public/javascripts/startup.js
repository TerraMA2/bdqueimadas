TerraMA2WebComponents.obj.init(terrama2Path, ["MapDisplay", "LayerExplorer"]);

var fillColors = { "0": "#FFEBCD", "100": "#FFC387", "500": "#FAA046", "1000": "#FA872D", "5000": "#FA5C25", "25000": "#C34231", "50000": "#A21C0D" };
var strokeColors = { "0": "#000000", "100": "#000000", "500": "#000000", "1000": "#000000", "5000": "#000000", "25000": "#000000", "50000": "#000000" };

BDQueimadas.obj.init(filterConfig, serverConfig, attributesTableConfig, componentsConfig, mapConfig);

var terrama2Interval = window.setInterval(function() {
  if(TerraMA2WebComponents.obj.isComponentsLoaded()) {

    /*
    TerraMA2WebComponents.webcomponents.MapDisplay.addGeoJSONVectorLayer('http://localhost:38000/get-countries-layer-features', 'countries', 'countries', true, fillColors, strokeColors,
      function(feature, fill, stroke) {
        var colorSelector = "0";
        if(parseInt(feature.get('fires_count')) > 0 && parseInt(feature.get('fires_count')) <= 100) colorSelector = "100";
        else if(parseInt(feature.get('fires_count')) > 100 && parseInt(feature.get('fires_count')) <= 500) colorSelector = "500";
        else if(parseInt(feature.get('fires_count')) > 500 && parseInt(feature.get('fires_count')) <= 1000) colorSelector = "1000";
        else if(parseInt(feature.get('fires_count')) > 1000 && parseInt(feature.get('fires_count')) <= 5000) colorSelector = "5000";
        else if(parseInt(feature.get('fires_count')) > 5000 && parseInt(feature.get('fires_count')) <= 25000) colorSelector = "25000";
        else if(parseInt(feature.get('fires_count')) > 25000 && parseInt(feature.get('fires_count')) <= 50000) colorSelector = "50000";
        return { "fillColor": fill[colorSelector], "strokeColor": stroke[colorSelector] };
      }
    );
    */

    TerraMA2WebComponents.webcomponents.MapDisplay.addBaseLayers('bases', 'Camadas Bases');

    TerraMA2WebComponents.webcomponents.MapDisplay.addTileWMSLayer(serverConfig.Servers.Local.URL, serverConfig.Servers.Local.Type, serverConfig.Servers.Local.StatesLayerId, serverConfig.Servers.Local.StatesLayerId, true, filterConfig.SpatialFilter.StatesMinimumResolution, filterConfig.SpatialFilter.StatesMaximumResolution, 'root');
    TerraMA2WebComponents.webcomponents.MapDisplay.addTileWMSLayer(serverConfig.Servers.Local.URL, serverConfig.Servers.Local.Type, serverConfig.Servers.Local.CountriesLayerId, serverConfig.Servers.Local.CountriesLayerId, true, filterConfig.SpatialFilter.CountriesMinimumResolution, filterConfig.SpatialFilter.CountriesMaximumResolution, 'root');
    TerraMA2WebComponents.webcomponents.MapDisplay.addTileWMSLayer(serverConfig.Servers.Local.URL, serverConfig.Servers.Local.Type, serverConfig.Servers.Local.FiresLayerId, serverConfig.Servers.Local.FiresLayerId, true, filterConfig.SpatialFilter.FiresMinimumResolution, filterConfig.SpatialFilter.FiresMaximumResolution, 'root');
    TerraMA2WebComponents.webcomponents.MapDisplay.addTileWMSLayer(serverConfig.Servers.Local.URL, serverConfig.Servers.Local.Type, serverConfig.Servers.Local.FiresChoroplethLayerId, serverConfig.Servers.Local.FiresChoroplethLayerId, true, filterConfig.SpatialFilter.FiresChoroplethMinimumResolution, filterConfig.SpatialFilter.FiresChoroplethMaximumResolution, 'root');
    TerraMA2WebComponents.webcomponents.MapDisplay.addCapabilitiesLayers(serverConfig.Servers.Local.URL + serverConfig.Servers.Local.CapabilitiesParams, serverConfig.Servers.Local.URL, 'geoserver', 'local', 'Local Server',
      function() {
        TerraMA2WebComponents.webcomponents.LayerExplorer.addLayersFromMap('local', 'root', 'terrama2-layerexplorer');
      }
    );

    TerraMA2WebComponents.webcomponents.MapDisplay.addTileWMSLayer(
      'https://queimadas.dgi.inpe.br/wms/queimadas/',
      'mapserver',
      'npp_250m_truecolor',
      'npp_250m_truecolor',
      true,
      null,
      null,
      'root',
      '2016-01-01'
    );

    clearInterval(terrama2Interval);
  }
}, 10);

var bdqueimadasInterval = window.setInterval(function() {
  if(BDQueimadas.obj.isComponentsLoaded()) {
    BDQueimadas.components.Map.addSubtitle(serverConfig.Servers.Local.FiresChoroplethLayerId);
    clearInterval(bdqueimadasInterval);
  }
}, 10);
