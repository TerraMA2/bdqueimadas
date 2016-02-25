"use strict";

/**
 * Attributes table class of the BDQueimadas.
 * @module AttributesTable
 *
 * @property {object} attributesTable - Attributes table object (DataTables).
 */
BDQueimadas.components.AttributesTable = (function() {

  // Attributes table object (DataTables)
  var attributesTable = null;

  /**
   * Creates and returns an array with the attributes table columns names.
   * @returns {array} columnsArray - Array of the columns names
   *
   * @private
   * @function getAttributesTableColumnNamesArray
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
   */
  var loadAttributesTable = function() {
    var columns = BDQueimadas.obj.getAttributesTableConfig().Columns;
    var columnsLength = columns.length;
    var titles = "";

    for(var i = 0; i < columnsLength; i++)
      titles += columns[i].Show ? "<th>" + (columns[i].Alias !== '' ? columns[i].Alias : columns[i].Name) + "</th>" : "";

    $('#attributes-table')
      .empty()
      .append("<thead>" + titles + "</thead><tfoot>" + titles + "</tfoot>");

    attributesTable = $('#attributes-table').DataTable(
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
            data.extent = TerraMA2WebComponents.webcomponents.MapDisplay.getCurrentExtension();
          }
        },
        "columns": getAttributesTableColumnNamesArray()
      }
    );
  };

  /**
   * Updates the attributes table.
   *
   * @function updateAttributesTable
   */
  var updateAttributesTable = function() {
    attributesTable.ajax.reload();
  };

  /**
   * Loads the DOM events.
   *
   * @private
   * @function loadEvents
   */
  var loadEvents = function() {
    $('#filterTableToExtent').on('click', function() {
      updateAttributesTable();
    });
  };

  /**
   * Initializes the necessary features.
   *
   * @function init
   */
  var init = function() {
    loadEvents();
    loadAttributesTable();
  };

  return {
    updateAttributesTable: updateAttributesTable,
  	init: init
  };
})();
