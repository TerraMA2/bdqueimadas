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

    $('#attributes-table').empty().append("<thead>" + titles + "</thead><tfoot>" + titles + "</tfoot>").DataTable(
      {
        "processing": true,
        "serverSide": true,
        "ajax": "/test"
      }
    );
  };

  var verifiesOutsideVars = function() {
    if(BDQueimadas.obj.getFeatureDescription() !== null && BDQueimadas.obj.getFeatures() !== null) {
      loadTable();
      clearInterval(interval);
    }
  };

  var init = function() {

    $('#box-attributes-table').attr('style', 'width: ' + ($("#terrama2-map").outerWidth() - 40) + 'px');

    $('.sidebar-toggle').on('click', function() {
      window.setTimeout(function() { $('#box-attributes-table').attr('style', 'width: ' + ($("#terrama2-map").outerWidth() - 40) + 'px'); }, 310);
    });

    interval = window.setInterval(verifiesOutsideVars, 3000);
  };

  return {
  	loadTable: loadTable,
  	init: init
  };
})();
