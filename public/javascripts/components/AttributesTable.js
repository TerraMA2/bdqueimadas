"use strict";

/**
 * Attributes table class of the BDQueimadas.
 * @class AttributesTable
 * @variation 2
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberAttributesTable - Attributes table object (DataTables).
 */
BDQueimadas.components.AttributesTable = (function() {

  // Attributes table object (DataTables)
  var memberAttributesTable = null;

  /**
   * Creates and returns an array with the attributes table columns names.
   * @returns {array} columnsArray - Array of the columns names
   *
   * @private
   * @function getAttributesTableColumnNamesArray
   * @memberof AttributesTable(2)
   * @inner
   */
  var getAttributesTableColumnNamesArray = function() {
    var columnsJson = BDQueimadas.obj.getAttributesTableConfig().Columns;
    var columnsJsonLength = columnsJson.length;
    var columnsArray = [];

    for(var i = 0; i < columnsJsonLength; i++)
      if(columnsJson[i].Show)
        columnsArray.push({ "name": columnsJson[i].Name });

    return columnsArray;
  };

  /**
   * Loads the attributes table.
   *
   * @private
   * @function loadAttributesTable
   * @memberof AttributesTable(2)
   * @inner
   */
  var loadAttributesTable = function() {
    var interval = window.setInterval(function() {
      if(TerraMA2WebComponents.obj.isComponentsLoaded()) {
        var columns = BDQueimadas.obj.getAttributesTableConfig().Columns;
        var columnsLength = columns.length;
        var titles = "";

        for(var i = 0; i < columnsLength; i++)
          titles += columns[i].Show ? "<th>" + (columns[i].Alias !== '' ? columns[i].Alias : columns[i].Name) + "</th>" : "";

        $('#attributes-table').empty().append("<thead>" + titles + "</thead><tfoot>" + titles + "</tfoot>");

        memberAttributesTable = $('#attributes-table').DataTable(
          {
            "order": [[ 5, 'asc' ], [ 6, 'asc' ]],
            "processing": true,
            "serverSide": true,
            "ajax": {
              "url": "/get-attributes-table",
              "type": "POST",
              "data": function(data) {
                data.dateFrom = BDQueimadas.components.Filter.getFormattedDateFrom('YYYYMMDD');
                data.dateTo = BDQueimadas.components.Filter.getFormattedDateTo('YYYYMMDD');
                data.satellite = BDQueimadas.components.Filter.getSatellite() !== "all" ? BDQueimadas.components.Filter.getSatellite() : '';
                data.extent = TerraMA2WebComponents.webcomponents.MapDisplay.getCurrentExtent();
              }
            },
            "columns": getAttributesTableColumnNamesArray()
          }
        );

        clearInterval(interval);
      }
    }, 10);
  };

  /**
   * Updates the attributes table.
   *
   * @function updateAttributesTable
   * @memberof AttributesTable(2)
   * @inner
   */
  var updateAttributesTable = function() {
    if($("#table-box").css('left') < '0px')
      memberAttributesTable.ajax.reload();
  };

  /**
   * Initializes the necessary features.
   *
   * @function init
   * @memberof AttributesTable(2)
   * @inner
   */
  var init = function() {
    $(document).ready(function() {
      loadAttributesTable();
    });
  };

  return {
    updateAttributesTable: updateAttributesTable,
  	init: init
  };
})();
