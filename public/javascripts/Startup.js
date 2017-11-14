requirejs.config({
  baseUrl: BASE_URL + 'javascripts',
  paths: {
    TerraMA2WebComponents: BASE_URL + 'externals/TerraMA2WebComponents/TerraMA2WebComponents.min'
  }
});

requirejs(
  ['BDQueimadas', 'components/Utils', 'components/Filter', 'components/AttributesTable', 'components/Graphics', 'components/Map', 'TerraMA2WebComponents'],
  function(BDQueimadas, Utils, Filter, AttributesTable, Graphics, Map, TerraMA2WebComponents) {
    // Adding the CSRF token to the ajax requests
    $.ajaxPrefilter(function(options, _, xhr) {
      if(!xhr.crossDomain) xhr.setRequestHeader('X-CSRF-Token', $('#_csrf').val());
    });

    TerraMA2WebComponents.LayerExplorer.init();
    TerraMA2WebComponents.MapDisplay.init();

    Utils.init(configurations, BASE_URL, specialRegions);
    BDQueimadas.init();
    Filter.init();
    AttributesTable.init();
    Graphics.init();
    Map.init();

    Filter.applyFilter();
    $.event.trigger({type: "updateComponents"});
  }
);
