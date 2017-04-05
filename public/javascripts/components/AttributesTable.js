"use strict";

/**
 * Attributes table class of the BDQueimadas.
 * @class AttributesTable
 * @variation 2
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberAttributesTable - Attributes table object (DataTables).
 * @property {date} memberDateTimeFrom - Current initial date / time filter.
 * @property {date} memberDateTimeTo - Current final date / time filter.
 * @property {string} memberSatellites - Current satellites filter.
 * @property {string} memberBiomes - Current biomes filter.
 * @property {int} memberContinent - Current continent filter.
 * @property {string} memberCountries - Current countries filter.
 * @property {string} memberStates - Current states filter.
 * @property {string} memberCities - Current cities filter.
 * @property {array} memberSpecialRegions - Current special regions.
 * @property {object} memberProtectedArea - Current protected area filter.
 * @property {boolean} memberIndustrialFires - Current industrial fires filter.
 */
define(
  ['components/Utils', 'components/Filter', 'TerraMA2WebComponents'],
  function(Utils, Filter, TerraMA2WebComponents) {

    // Attributes table object (DataTables)
    var memberAttributesTable = null;
    // Current initial date / time filter
    var memberDateTimeFrom = null;
    // Current final date / time filter
    var memberDateTimeTo = null;
    // Current satellites filter
    var memberSatellites = "all";
    // Current biomes filter
    var memberBiomes = "all";
    // Current continent filter
    var memberContinent = null;
    // Current countries filter
    var memberCountries = null;
    // Current states filter
    var memberStates = null;
    // Current cities filter
    var memberCities = null;
    // Current special regions
    var memberSpecialRegions = null;
    // Current protected area
    var memberProtectedArea = null;
    // Current industrial fires filter
    var memberIndustrialFires = false;

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
     * Returns the countries, states, cities and special regions to be filtered.
     * @param {function} callback - Callback function
     * @returns {function} callback - Execution of the callback function, which will process the received data
     *
     * @private
     * @function getSpatialFilterData
     * @memberof AttributesTable(2)
     * @inner
     */
    var getSpatialFilterData = function(callback) {
      var continent = $('#continents-attributes-table').val();
      var countries = $('#countries-attributes-table').val() === null || (Utils.stringInArray($('#countries-attributes-table').val(), "") || $('#countries-attributes-table').val().length === 0) ? [] : $('#countries-attributes-table').val();
      var states = $('#states-attributes-table').val() === null || Utils.stringInArray($('#states-attributes-table').val(), "") || $('#states-attributes-table').val().length === 0 ? [] : $('#states-attributes-table').val();

      var filterStates = [];
      var specialRegions = [];

      $('#states-attributes-table > option').each(function() {
        if(Utils.stringInArray(states, $(this).val()) && $(this).data('special-region') !== undefined && $(this).data('special-region')) {
          specialRegions.push($(this).val());
        } else if(Utils.stringInArray(states, $(this).val()) && ($(this).data('special-region') === undefined || !$(this).data('special-region'))) {
          filterStates.push($(this).val());
        }
      });

      var filterCity = $('#city-attributes-table').data('value') !== undefined && $('#city-attributes-table').data('value') !== null && $('#city-attributes-table').data('value') !== '' ? $('#city-attributes-table').data('value') : Filter.getCity();
      filterCity = filterCity !== null ? filterCity : "";

      callback(continent.toString(), countries.toString(), filterStates.toString(), filterCity, specialRegions.toString());
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

      memberDateTimeFrom = Filter.getFormattedDateFrom(Utils.getConfigurations().firesDateFormat) + ' ' + Filter.getTimeFrom();
      memberDateTimeTo = Filter.getFormattedDateTo(Utils.getConfigurations().firesDateFormat) + ' ' + Filter.getTimeTo();

      if(Filter.isInitialFilter()) {
        memberSatellites = Filter.getInitialSatellites().toString();
      } else {
        memberSatellites = (Utils.stringInArray(Filter.getSatellites(), "all") ? '' : Filter.getSatellites().toString());
      }

      memberBiomes = (Utils.stringInArray(Filter.getBiomes(), "all") ? '' : Filter.getBiomes().toString());
      memberProtectedArea = Filter.getProtectedArea();

      memberIndustrialFires = Filter.getIndustrialFires();

      getSpatialFilterData(function(continent, countries, states, cities, specialRegions) {
        memberContinent = continent;
        memberCountries = countries;
        memberStates = states;
        memberCities = cities;
        memberSpecialRegions = specialRegions;

        memberAttributesTable = $('#attributes-table').DataTable(
          {
            "order": getAttributesTableOrder(),
            "processing": true,
            "serverSide": true,
            "ajax": {
              "url": Utils.getBaseUrl() + "get-attributes-table",
              "type": "POST",
              "data": function(data) {
                data.dateTimeFrom = memberDateTimeFrom;
                data.dateTimeTo = memberDateTimeTo;
                data.satellites = memberSatellites;
                data.biomes = memberBiomes;
                data.continent = memberContinent;
                data.countries = memberCountries;
                data.states = memberStates;
                data.cities = memberCities;
                data.specialRegions = memberSpecialRegions;
                data.protectedArea = memberProtectedArea;
                data.industrialFires = memberIndustrialFires;
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
      });
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
      $('#filter-error-dates-attributes-table').text('');

      if(memberAttributesTable !== null) {
        var dates = Utils.getFilterDates(true, true, true, (useAttributesTableFilter ? 1 : 0));
        var times = Utils.getFilterTimes(true, (useAttributesTableFilter ? 1 : 0));

        if(dates !== null && times !== null) {
          if(dates.length === 0) {
            $('#filter-error-dates-attributes-table').text('Datas inválidas!');
          } else if(times.length === 0) {
            $('#filter-error-dates-attributes-table').text('Horas inválidas!');
          } else {
            memberDateTimeFrom = Utils.dateToString(Utils.stringToDate(dates[0], 'YYYY/MM/DD'), Utils.getConfigurations().firesDateFormat) + ' ' + times[0];
            memberDateTimeTo = Utils.dateToString(Utils.stringToDate(dates[1], 'YYYY/MM/DD'), Utils.getConfigurations().firesDateFormat) + ' ' + times[1];

            if(useAttributesTableFilter) {
              memberSatellites = (Utils.stringInArray($('#filter-satellite-attributes-table').val(), "all") ? '' : $('#filter-satellite-attributes-table').val().toString());
              memberBiomes = (Utils.stringInArray($('#filter-biome-attributes-table').val(), "all") ? '' : $('#filter-biome-attributes-table').val().toString());
            } else {
              if(Filter.isInitialFilter()) {
                memberSatellites = Filter.getInitialSatellites().toString();
              } else {
                memberSatellites = (Utils.stringInArray(Filter.getSatellites(), "all") ? '' : Filter.getSatellites().toString());
              }

              memberBiomes = (Utils.stringInArray(Filter.getBiomes(), "all") ? '' : Filter.getBiomes().toString());

              $('#filter-date-from-attributes-table').val(Filter.getFormattedDateFrom('YYYY/MM/DD'));
              $('#filter-date-to-attributes-table').val(Filter.getFormattedDateTo('YYYY/MM/DD'));
            }

            memberProtectedArea = useAttributesTableFilter ?
                                  ($('#pas-attributes-table').data('value') !== undefined && $('#pas-attributes-table').data('value') !== '' ? JSON.parse($('#pas-attributes-table').data('value')) : null) :
                                  Filter.getProtectedArea();

            memberIndustrialFires = Filter.getIndustrialFires();

            Filter.updateSatellitesSelect(1, Utils.stringToDate(dates[0], 'YYYY/MM/DD'), Utils.stringToDate(dates[1], 'YYYY/MM/DD'));

            getSpatialFilterData(function(continent, countries, states, cities, specialRegions) {
              memberContinent = continent;
              memberCountries = countries;
              memberStates = states;
              memberCities = cities;
              memberSpecialRegions = specialRegions;

              memberAttributesTable.ajax.reload();
            });
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
        Utils.getSocket().emit('countriesByContinentRequest', { continent: Utils.getConfigurations().applicationConfigurations.InitialContinentToFilter, filter: 1 });
        $('#continents-attributes-table').val(Utils.getConfigurations().applicationConfigurations.InitialContinentToFilter);
      });
    };

    return {
      updateAttributesTable: updateAttributesTable,
    	init: init
    };
  }
);
