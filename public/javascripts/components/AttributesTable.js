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
define(
  ['components/Utils', 'components/Filter', 'TerraMA2WebComponents'],
  function(Utils, Filter, TerraMA2WebComponents) {

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
      var columnsJson = Utils.getConfigurations().attributesTableConfigurations.Columns;
      var columnsJsonLength = columnsJson.length;
      var columnsArray = [];

      for(var i = 0; i < columnsJsonLength; i++)
        columnsArray.push({ "name": columnsJson[i].Name });

      return columnsArray;
    };

    /**
     * Creates and returns an array with the attributes table order data.
     * @returns {Array} order - Array of the order data
     *
     * @private
     * @function getAttributesTableOrder
     * @memberof AttributesTable(2)
     * @inner
     */
    var getAttributesTableOrder = function() {
      var columnsJson = Utils.getConfigurations().attributesTableConfigurations.Columns;
      var columnsJsonLength = columnsJson.length;
      var order = [];

      for(var i = 0; i < columnsJsonLength; i++)
        if(columnsJson[i].Order !== null && (columnsJson[i].Order === "asc" || columnsJson[i].Order === "desc"))
          order.push([i, columnsJson[i].Order]);

      return order;
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
      var columns = Utils.getConfigurations().attributesTableConfigurations.Columns;
      var columnsLength = columns.length;
      var titles = "";

      for(var i = 0; i < columnsLength; i++)
        titles += "<th>" + (columns[i].Alias !== '' ? columns[i].Alias : columns[i].Name) + "</th>";

      $('#attributes-table').empty().append("<thead>" + titles + "</thead><tfoot>" + titles + "</tfoot>");

      memberAttributesTable = $('#attributes-table').DataTable(
        {
          "order": getAttributesTableOrder(),
          "processing": true,
          "serverSide": true,
          "ajax": {
            "url": Utils.getBaseUrl() + "get-attributes-table",
            "type": "POST",
            "data": function(data) {
              data.dateFrom = Filter.getFormattedDateFrom(Utils.getConfigurations().firesDateFormat);
              data.dateTo = Filter.getFormattedDateTo(Utils.getConfigurations().firesDateFormat);
              data.satellite = Filter.getSatellite() !== "all" ? Filter.getSatellite() : '';
              data.extent = TerraMA2WebComponents.MapDisplay.getCurrentExtent();
              data.country = Filter.getCountry();
              data.state = Filter.getState();
            }
          },
          "columns": getAttributesTableColumnNamesArray(),
          "language": {
            "emptyTable": "<p class='text-center'>Nenhum registro a ser exibido</p>",
            "info": "Exibindo _START_ at&eacute; _END_ de _TOTAL_ registros",
            "infoEmpty": "Exibindo 0 at&eacute; 0 de 0 registros",
            "infoFiltered": "(filtrado de _MAX_ registros)",
            "lengthMenu": "Exibir _MENU_ registros",
            "loadingRecords": "Carregando...",
            "processing": "Processando...",
            "search": "Pesquisa:",
            "zeroRecords": "<p class='text-center'>Nenhum registro encontrado</p>",
            "paginate": {
              "first": "Primeira",
              "last": "&Uacute;ltima",
              "next": "Pr&oacute;xima",
              "previous": "Anterior"
            }
          }
        }
      );
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
  }
);
