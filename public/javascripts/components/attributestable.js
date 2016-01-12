/** Filter class of the BDQueimadas. */
var AttributesTable = function(bdqueimadas) {

  var _this = this;

  var strInArr = function(arr, str) {
    for(i = 0, j = arr.length; i < j; i++) {
      if(arr[i] === str) {
        return true;
      }
    }
    return false;
  }

  _this.loadTable = function() {
    var ignore = ['the_geom', 'Id'];
    var featureDescription = JSON.parse(bdqueimadas.getFeatureDescription());
    var featuresDescriptionLength = featureDescription.featureTypes[0].properties.length;
    var features = JSON.parse(bdqueimadas.getFeatures());
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
  }

  var verifiesOutsideVars = function() {
    if(bdqueimadas.getFeatureDescription() !== null && bdqueimadas.getFeatures() !== null) {
      _this.loadTable();
      clearInterval(interval);
    }
  }

  var interval = window.setInterval(verifiesOutsideVars, 3000);
};
