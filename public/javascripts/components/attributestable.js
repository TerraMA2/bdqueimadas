/** Filter class of the BDQueimadas. */
BDQueimadas.components.AttributesTable = (function() {

  var interval = null;
  var table = null;

  var updateTable = function() {
    table.ajax.reload();
  }

  var strInArr = function(arr, str) {
    for(i = 0, j = arr.length; i < j; i++) {
      if(arr[i] === str) {
        return true;
      }
    }
    return false;
  };

  var loadTable = function() {
    //var ignore = ['the_geom', 'Id'];
    var ignore = ['gid'];
    var featureDescription = JSON.parse(BDQueimadas.obj.getFeatureDescription());
    var featuresDescriptionLength = featureDescription.featureTypes[0].properties.length;
    var titles = "";
    var items = "";

    for(var i = 0; i < featuresDescriptionLength; i++) {
      if(!strInArr(ignore, featureDescription.featureTypes[0].properties[i].name)) {
        titles += "<th>" + featureDescription.featureTypes[0].properties[i].name + "</th>";
      }
    }

    $('#attributes-table')
      .empty()
      .append("<thead>" + titles + "</thead><tfoot>" + titles + "</tfoot>");

    table = $('#attributes-table').DataTable(
      {
        "processing": true,
        "serverSide": true,
        "ajax": {
          "url": "/get-attributes-table",
          "type": "POST",
          "data": function(data) {
            data.dateFrom = BDQueimadas.components.Filter.getFormattedDateFrom();
            data.dateTo = BDQueimadas.components.Filter.getFormattedDateTo();
            data.satellite = BDQueimadas.components.Filter.getSatellite() !== "all" ? BDQueimadas.components.Filter.getSatellite() : '';
          }
        }
      }
    );
  };

  var verifiesOutsideVars = function() {
    if(BDQueimadas.obj.getFeatureDescription() !== null) {
      loadTable();
      clearInterval(interval);
    }
  };

  var init = function() {
    interval = window.setInterval(verifiesOutsideVars, 3000);
  };

  return {
  	loadTable: loadTable,
    updateTable: updateTable,
  	init: init
  };
})();
