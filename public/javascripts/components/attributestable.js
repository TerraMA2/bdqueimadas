/** Filter class of the BDQueimadas. */
BDQueimadas.components.AttributesTable = (function() {

  var interval = null;

  var strInArr = function(arr, str) {
    for(i = 0, j = arr.length; i < j; i++) {
      if(arr[i] === str) {
        return true;
      }
    }
    return false;
  };

  var loadTable = function() {
    var ignore = ['the_geom', 'Id'];
    var featureDescription = JSON.parse(BDQueimadas.obj.getFeatureDescription());
    var featuresDescriptionLength = featureDescription.featureTypes[0].properties.length;
    var features = JSON.parse(BDQueimadas.obj.getFeatures());
    var titles = "";
    var items = "";

    for(var i = 0; i < featuresDescriptionLength; i++) {
      if(!strInArr(ignore, featureDescription.featureTypes[0].properties[i].name)) {
        titles += "<th>" + featureDescription.featureTypes[0].properties[i].name + "</th>";
      }
    }

    //for(var i = 0; i < features.totalFeatures; i++) {
    for(var i = 0; i < 1000; i++) {
      items += "<tr>";
      for(var j = 0; j < featuresDescriptionLength; j++) {
        if(!strInArr(ignore, featureDescription.featureTypes[0].properties[j].name)) {
          items += "<td>" + features.features[i].properties[featureDescription.featureTypes[0].properties[j].name] + "</td>";
        }
      }
      items += "</tr>";
    }

    $('#attributes-table').empty().append("<thead>" + titles + "</thead><tfoot>" + titles + "</tfoot><tbody>" + items + "</tbody>").DataTable();
  };

  var verifiesOutsideVars = function() {
    if(BDQueimadas.obj.getFeatureDescription() !== null && BDQueimadas.obj.getFeatures() !== null) {
      loadTable();
      clearInterval(interval);
    }
  };

  var init = function() {
    interval = window.setInterval(verifiesOutsideVars, 3000);
  };

  return {
  	loadTable: loadTable,
  	init: init
  };
})();
