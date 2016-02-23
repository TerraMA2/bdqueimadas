/** Filter class of the BDQueimadas. */
BDQueimadas.components.AttributesTable = (function() {

  var interval = null;
  var table = null;
  var activeColumnNames = [];

  var updateTable = function() {
    var columns = BDQueimadas.obj.getAttributesTableConfig().Columns;
    var columnsLength = columns.length;
    activeColumnNames = [];

    for(var i = 0; i < columnsLength; i++)
      if(columns[i].Show)
        activeColumnNames.push({ "name": columns[i].Name });

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
    var columns = BDQueimadas.obj.getAttributesTableConfig().Columns;
    var columnsLength = columns.length;
    var titles = "";

    for(var i = 0; i < columnsLength; i++) {
      if(columns[i].Show) activeColumnNames.push({ "name": columns[i].Name });
      titles += columns[i].Show ? "<th>" + (columns[i].Alias !== '' ? columns[i].Alias : columns[i].Name) + "</th>" : "";
    }

    $('#attributes-table')
      .empty()
      .append("<thead>" + titles + "</thead><tfoot>" + titles + "</tfoot>");

    activeColumnNames.push();

    table = $('#attributes-table').DataTable(
      {
        "order": [[ 5, 'asc' ], [ 6, 'asc' ]],
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
        },
        "columns": activeColumnNames
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
