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
 * @property {string} memberSatellites - Current satellites filter.
 * @property {string} memberBiomes - Current biomes filter.
 * @property {string} memberCountries - Current countries filter.
 * @property {string} memberStates - Current states filter.
 * @property {string} memberCities - Current cities filter.
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
    var memberSatellites = "all";
    // Current biomes filter
    var memberBiomes = "all";
    // Current countries filter
    var memberCountries = null;
    // Current states filter
    var memberStates = null;
    // Current cities filter
    var memberCities = null;

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
     * Returns the countries, states and cities to be filtered.
     * @param {function} callback - Callback function
     * @returns {function} callback - Execution of the callback function, which will process the received data
     *
     * @private
     * @function getSpatialFilterData
     * @memberof AttributesTable(2)
     * @inner
     */
    var getSpatialFilterData = function(callback) {
      var countries = $('#countries-attributes-table').val() === null || (Utils.stringInArray($('#countries-attributes-table').val(), "") || $('#countries-attributes-table').val().length === 0) ? [] : $('#countries-attributes-table').val();
      var countriesNames = [];

      if(($('#continents-attributes-table').val() !== null && $('#continents-attributes-table').val() == Utils.getConfigurations().applicationConfigurations.InitialContinentToFilter) && countries.length == 0) {
        var initialContinentCountries = Utils.getConfigurations().applicationConfigurations.InitialContinentCountries;
        var initialContinentCountriesLength = initialContinentCountries.length;

        for(var i = 0; i < initialContinentCountriesLength; i++) {
          countriesNames.push(initialContinentCountries[i].Name);
        }
      }

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

      var specialRegionsData = Filter.createSpecialRegionsArrays(specialRegions);

      countries = countries.toString();

      var specialRegionsCountriesNames = JSON.parse(JSON.stringify(specialRegionsData.specialRegionsCountries));

      if(countries.length > 0) {
        Filter.updateCountriesBdqNames(function(namesArrayCountries) {
          var arrayOne = JSON.parse(JSON.stringify(namesArrayCountries));
          var arrayTwo = JSON.parse(JSON.stringify(specialRegionsCountriesNames));

          namesArrayCountries = $.merge(arrayOne, arrayTwo);

          states = JSON.parse(JSON.stringify(filterStates));
          states = states.toString();

          var specialRegionsStatesNames = JSON.parse(JSON.stringify(specialRegionsData.specialRegionsStates));

          var cities = specialRegionsData.specialRegionsCities.toString();

          if(states.length > 0) {
            Filter.updateStatesBdqNames(function(namesArrayStates) {
              var arrayOne = JSON.parse(JSON.stringify(namesArrayStates));
              var arrayTwo = JSON.parse(JSON.stringify(specialRegionsStatesNames));

              namesArrayStates = $.merge(arrayOne, arrayTwo);

              callback(namesArrayCountries.toString(), namesArrayStates.toString(), cities);
            }, states);
          } else {
            callback(namesArrayCountries.toString(), specialRegionsStatesNames.toString(), cities);
          }
        }, countries);
      } else {
        var arrayOne = JSON.parse(JSON.stringify(countriesNames));
        var arrayTwo = JSON.parse(JSON.stringify(specialRegionsCountriesNames));

        countriesNames = $.merge(arrayOne, arrayTwo);

        callback(countriesNames.toString(), "", "");
      }
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

      getSpatialFilterData(function(countries, states, cities) {
        memberCountries = countries;
        memberStates = states;
        memberCities = cities;

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
                data.countries = memberCountries;
                data.states = memberStates;
                data.cities = memberCities;
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

            getSpatialFilterData(function(countries, states, cities) {
              memberCountries = countries;
              memberStates = states;
              memberCities = cities;

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
