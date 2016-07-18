"use strict";

/**
 * Attributes table class of the BDQueimadas.
 * @class AttributesTable
 * @variation 2
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberAttributesTable - Attributes table object (DataTables).
 * @property {date} memberDateFrom - Current initial date filter.
 * @property {date} memberDateTo - Current final date filter.
 * @property {array} memberSatellites - Current satellites filter.
 * @property {array} memberBiomes - Current biomes filter.
 */
define(
  ['components/Utils', 'components/Filter', 'TerraMA2WebComponents'],
  function(Utils, Filter, TerraMA2WebComponents) {

    // Attributes table object (DataTables)
    var memberAttributesTable = null;
    // Current initial date filter
    var memberDateFrom = null;
    // Current final date filter
    var memberDateTo = null;
    // Current satellites filter
    var memberSatellites = ["all"];
    // Current biomes filter
    var memberBiomes = ["all"];

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

      memberDateFrom = Filter.getFormattedDateFrom(Utils.getConfigurations().firesDateFormat);
      memberDateTo = Filter.getFormattedDateTo(Utils.getConfigurations().firesDateFormat);
      memberSatellites = (Utils.stringInArray(Filter.getSatellites(), "all") ? '' : Filter.getSatellites().toString());
      memberBiomes = (Utils.stringInArray(Filter.getBiomes(), "all") ? '' : Filter.getBiomes().toString());

      memberAttributesTable = $('#attributes-table').DataTable(
        {
          "order": getAttributesTableOrder(),
          "processing": true,
          "serverSide": true,
          "ajax": {
            "url": Utils.getBaseUrl() + "get-attributes-table",
            "type": "POST",
            "data": function(data) {
              data.dateFrom = memberDateFrom;
              data.dateTo = memberDateTo;
              data.satellites = memberSatellites;
              data.biomes = memberBiomes;
              data.extent = TerraMA2WebComponents.MapDisplay.getCurrentExtent();
              data.countries = (Utils.stringInArray(Filter.getCountriesBdqNames(), "") || Filter.getCountriesBdqNames().length === 0 ? '' : Filter.getCountriesBdqNames().toString());
              data.states = (Utils.stringInArray(Filter.getStatesBdqNames(), "") || Filter.getStatesBdqNames().length === 0 ? '' : Filter.getStatesBdqNames().toString());
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
     * @param {boolean} useAttributesTableFilter - Flag that indicates if the attributes table filter should be used
     *
     * @function updateAttributesTable
     * @memberof AttributesTable(2)
     * @inner
     */
    var updateAttributesTable = function(useAttributesTableFilter) {
      if(memberAttributesTable !== null) {
        var dates = Utils.getFilterDates(true, (useAttributesTableFilter ? 1 : 0));

        if(dates !== null) {
          if(dates.length === 0) {
            vex.dialog.alert({
              message: '<p class="text-center">Datas inválidas!</p>',
              buttons: [{
                type: 'submit',
                text: 'Ok',
                className: 'bdqueimadas-btn'
              }]
            });
          } else {
            memberDateFrom = Utils.dateToString(Utils.stringToDate(dates[0], 'YYYY/MM/DD'), Utils.getConfigurations().firesDateFormat);
            memberDateTo = Utils.dateToString(Utils.stringToDate(dates[1], 'YYYY/MM/DD'), Utils.getConfigurations().firesDateFormat);

            if(useAttributesTableFilter) {
              memberSatellites = (Utils.stringInArray($('#filter-satellite-attributes-table').val(), "all") ? '' : $('#filter-satellite-attributes-table').val().toString());
              memberBiomes = (Utils.stringInArray($('#filter-biome-attributes-table').val(), "all") ? '' : $('#filter-biome-attributes-table').val().toString());
            } else {
              memberSatellites = (Utils.stringInArray(Filter.getSatellites(), "all") ? '' : Filter.getSatellites().toString());
              memberBiomes = (Utils.stringInArray(Filter.getBiomes(), "all") ? '' : Filter.getBiomes().toString());

              $('#filter-date-from-attributes-table').val(Filter.getFormattedDateFrom('YYYY/MM/DD'));
              $('#filter-date-to-attributes-table').val(Filter.getFormattedDateTo('YYYY/MM/DD'));
            }

            memberAttributesTable.ajax.reload();
          }
        }
      }
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
