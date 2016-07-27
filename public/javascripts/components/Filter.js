"use strict";

/**
 * Filter class of the BDQueimadas.
 * @class Filter
 * @variation 2
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {date} memberDateFrom - Current initial date.
 * @property {date} memberDateTo - Current final date.
 * @property {array} memberSatellites - Current satellites.
 * @property {array} memberBiomes - Current biomes.
 * @property {string} memberContinent - Current continent.
 * @property {array} memberCountries - Current countries.
 * @property {array} memberCountriesBdqNames - Current countries BDQ names.
 * @property {array} memberStates - Current states.
 * @property {array} memberStatesBdqNames - Current states BDQ names.
 */
define(
  ['components/Utils', 'components/Map', 'TerraMA2WebComponents'],
  function(Utils, Map, TerraMA2WebComponents) {

    // Current initial date
    var memberDateFrom = null;
    // Current final date
    var memberDateTo = null;
    // Current satellites
    var memberSatellites = ["all"];
    // Current biomes
    var memberBiomes = ["all"];
    // Current continent
    var memberContinent = null;
    // Current countries
    var memberCountries = [];
    // Current countries BDQ names
    var memberCountriesBdqNames = [];
    // Current states
    var memberStates = [];
    // Current states BDQ names
    var memberStatesBdqNames = [];

    /**
     * Returns the initial date formatted with the received format.
     * @param {string} format - Format
     * @returns {string} Utils.dateToString() - Formatted initial date (string)
     *
     * @function getFormattedDateFrom
     * @memberof Filter(2)
     * @inner
     */
    var getFormattedDateFrom = function(format) {
      return Utils.dateToString(memberDateFrom, format);
    };

    /**
     * Returns the final date formatted with the received format.
     * @param {string} format - Format
     * @returns {string} Utils.dateToString() - Formatted final date (string)
     *
     * @function getFormattedDateTo
     * @memberof Filter(2)
     * @inner
     */
    var getFormattedDateTo = function(format) {
      return Utils.dateToString(memberDateTo, format);
    };

    /**
     * Sets the satellites array.
     * @param {array} satellites - Satellites array
     *
     * @function setSatellites
     * @memberof Filter(2)
     * @inner
     */
    var setSatellites = function(satellites) {
      memberSatellites = satellites;
    };

    /**
     * Returns the satellites array.
     * @returns {array} memberSatellites - Satellites array
     *
     * @function getSatellites
     * @memberof Filter(2)
     * @inner
     */
    var getSatellites = function() {
      return memberSatellites;
    };

    /**
     * Sets the biomes array.
     * @param {array} biomes - Biomes array
     *
     * @function setBiomes
     * @memberof Filter(2)
     * @inner
     */
    var setBiomes = function(biomes) {
      memberBiomes = biomes;
    };

    /**
     * Returns the biomes array.
     * @returns {array} memberBiomes - Biomes array
     *
     * @function getBiomes
     * @memberof Filter(2)
     * @inner
     */
    var getBiomes = function() {
      return memberBiomes;
    };

    /**
     * Sets the continent.
     * @param {string} continent - Continent
     *
     * @function setContinent
     * @memberof Filter(2)
     * @inner
     */
    var setContinent = function(continent) {
      memberContinent = continent;
    };

    /**
     * Returns the continent.
     * @returns {string} memberContinent - Continent
     *
     * @function getContinent
     * @memberof Filter(2)
     * @inner
     */
    var getContinent = function() {
      return memberContinent;
    };

    /**
     * Sets the countries array.
     * @param {array} countries - Countries array
     *
     * @function setCountries
     * @memberof Filter(2)
     * @inner
     */
    var setCountries = function(countries) {
      memberCountries = countries;
    };

    /**
     * Returns the countries array.
     * @returns {array} memberCountries - Countries array
     *
     * @function getCountries
     * @memberof Filter(2)
     * @inner
     */
    var getCountries = function() {
      return memberCountries;
    };

    /**
     * Sets the countries BDQ names array.
     * @param {array} countriesBdqNames - Countries BDQ names array
     *
     * @function setCountriesBdqNames
     * @memberof Filter(2)
     * @inner
     */
    var setCountriesBdqNames = function(countriesBdqNames) {
      memberCountriesBdqNames = countriesBdqNames;
    };

    /**
     * Updates the countries BDQ names array.
     * @param {function} callback - Callback function
     *
     * @function updateCountriesBdqNames
     * @memberof Filter(2)
     * @inner
     */
    var updateCountriesBdqNames = function(callback) {
      $.ajax({
        url: Utils.getBaseUrl() + "get-bdq-names",
        type: "GET",
        data: {
          key: "Countries",
          ids: getCountries().toString()
        },
        success: function(names) {
          var namesArray = [];

          for(var i = 0; i < names.names.rowCount; i++) {
            namesArray.push(names.names.rows[i].name);
          }

          setCountriesBdqNames(namesArray);

          if(callback !== null) callback();
        }
      });
    };

    /**
     * Returns the countries BDQ names array.
     * @returns {array} memberCountriesBdqNames - Countries BDQ names array
     *
     * @function getCountriesBdqNames
     * @memberof Filter(2)
     * @inner
     */
    var getCountriesBdqNames = function() {
      return memberCountriesBdqNames;
    };

    /**
     * Clears the list of selected countries.
     *
     * @function clearCountries
     * @memberof Filter(2)
     * @inner
     */
    var clearCountries = function() {
      setCountries([]);
      setCountriesBdqNames([]);
      $("#countries option:selected").removeAttr("selected");
    };

    /**
     * Sets the states array.
     * @param {array} states - States array
     *
     * @function setStates
     * @memberof Filter(2)
     * @inner
     */
    var setStates = function(states) {
      memberStates = states;
    };

    /**
     * Returns the states array.
     * @returns {array} memberStates - States array
     *
     * @function getStates
     * @memberof Filter(2)
     * @inner
     */
    var getStates = function() {
      return memberStates;
    };

    /**
     * Sets the states BDQ names array.
     * @param {array} statesBdqNames - States BDQ names array
     *
     * @function setStatesBdqNames
     * @memberof Filter(2)
     * @inner
     */
    var setStatesBdqNames = function(statesBdqNames) {
      memberStatesBdqNames = statesBdqNames;
    };

    /**
     * Updates the states BDQ names array.
     * @param {function} callback - Callback function
     *
     * @function updateStatesBdqNames
     * @memberof Filter(2)
     * @inner
     */
    var updateStatesBdqNames = function(callback) {
      $.ajax({
        url: Utils.getBaseUrl() + "get-bdq-names",
        type: "GET",
        data: {
          key: "States",
          ids: getStates().toString()
        },
        success: function(names) {
          var namesArray = [];

          for(var i = 0; i < names.names.rowCount; i++) {
            namesArray.push(names.names.rows[i].name);
          }

          setStatesBdqNames(namesArray);

          if(callback !== null) callback();
        }
      });
    };

    /**
     * Returns the states BDQ names array.
     * @returns {array} memberStatesBdqNames - States BDQ names array
     *
     * @function getStatesBdqNames
     * @memberof Filter(2)
     * @inner
     */
    var getStatesBdqNames = function() {
      return memberStatesBdqNames;
    };

    /**
     * Clears the list of selected states.
     *
     * @function clearStates
     * @memberof Filter(2)
     * @inner
     */
    var clearStates = function() {
      setStates([]);
      setStatesBdqNames([]);
      $("#states option:selected").removeAttr("selected");
    };

    /**
     * Updates the BDQ names arrays.
     * @param {function} callback - Callback function
     *
     * @function updateBdqNames
     * @memberof Filter(2)
     * @inner
     */
    var updateBdqNames = function(callback) {
      $.ajax({
        url: Utils.getBaseUrl() + "get-bdq-names",
        type: "GET",
        data: {
          statesIds: getStates().toString(),
          countriesIds: getCountries().toString()
        },
        success: function(names) {
          var countriesNamesArray = [];
          var statesNamesArray = [];

          for(var i = 0; i < names.countriesNames.rowCount; i++) {
            countriesNamesArray.push(names.countriesNames.rows[i].name);
          }

          for(var i = 0; i < names.statesNames.rowCount; i++) {
            statesNamesArray.push(names.statesNames.rows[i].name);
          }

          setCountriesBdqNames(countriesNamesArray);
          setStatesBdqNames(statesNamesArray);

          if(callback !== null) callback();
        }
      });
    };

    /**
     * Creates the date filter.
     * @returns {string} cql - Date cql filter
     *
     * @private
     * @function createDateFilter
     * @memberof Filter(2)
     * @inner
     */
    var createDateFilter = function() {
      var cql = Utils.getConfigurations().filterConfigurations.LayerToFilter.DateFieldName + ">=" + Utils.dateToString(memberDateFrom, Utils.getConfigurations().filterConfigurations.LayerToFilter.DateFormat);
      cql += " and ";
      cql += Utils.getConfigurations().filterConfigurations.LayerToFilter.DateFieldName + "<=" + Utils.dateToString(memberDateTo, Utils.getConfigurations().filterConfigurations.LayerToFilter.DateFormat);

      return cql;
    };

    /**
     * Updates the initial and the final date.
     * @param {string} newDateFrom - New initial date (string)
     * @param {string} newDateTo - New final date (string)
     * @param {string} format - Dates format
     *
     * @function updateDates
     * @memberof Filter(2)
     * @inner
     */
    var updateDates = function(newDateFrom, newDateTo, format) {
      memberDateFrom = Utils.stringToDate(newDateFrom, format);
      memberDateTo = Utils.stringToDate(newDateTo, format);

      memberDateFrom.setHours(0,0,0,0);
      memberDateTo.setHours(0,0,0,0);

      $('#filter-date-from').val(Utils.dateToString(memberDateFrom, 'YYYY/MM/DD'));
      $('#filter-date-to').val(Utils.dateToString(memberDateTo, 'YYYY/MM/DD'));
    };

    /**
     * Updates the initial and the final date to the current date.
     *
     * @function updateDatesToCurrent
     * @memberof Filter(2)
     * @inner
     */
    var updateDatesToCurrent = function() {
      memberDateFrom = new Date();
      memberDateTo = new Date();
      memberDateFrom.setHours(memberDateFrom.getHours() - 24);

      memberDateFrom.setHours(0,0,0,0);
      memberDateTo.setHours(0,0,0,0);

      $('#filter-date-from').val(Utils.dateToString(memberDateFrom, 'YYYY/MM/DD'));
      $('#filter-date-to').val(Utils.dateToString(memberDateTo, 'YYYY/MM/DD'));

      $('#filter-date-from-attributes-table').val(Utils.dateToString(memberDateFrom, 'YYYY/MM/DD'));
      $('#filter-date-to-attributes-table').val(Utils.dateToString(memberDateTo, 'YYYY/MM/DD'));

      $('#filter-date-from-graphics').val(Utils.dateToString(memberDateFrom, 'YYYY/MM/DD'));
      $('#filter-date-to-graphics').val(Utils.dateToString(memberDateTo, 'YYYY/MM/DD'));
    };

    /**
     * Creates the satellites filter.
     * @returns {string} cql - Satellites cql filter
     *
     * @private
     * @function createSatellitesFilter
     * @memberof Filter(2)
     * @inner
     */
    var createSatellitesFilter = function() {
      var cql = "(";

      for(var i = 0; i < memberSatellites.length; i++) {
        cql += Utils.getConfigurations().filterConfigurations.LayerToFilter.SatelliteFieldName + "='" + memberSatellites[i] + "' OR ";
      }

      cql = cql.substring(0, cql.length - 4) + ")";

      return cql;
    };

    /**
     * Creates the biomes filter.
     * @returns {string} cql - Biomes cql filter
     *
     * @private
     * @function createBiomesFilter
     * @memberof Filter(2)
     * @inner
     */
    var createBiomesFilter = function() {
      var cql = "(";

      for(var i = 0; i < memberBiomes.length; i++) {
        cql += Utils.getConfigurations().filterConfigurations.LayerToFilter.BiomeFieldName + "='" + memberBiomes[i] + "' OR ";
      }

      cql = cql.substring(0, cql.length - 4) + ")";

      return cql;
    };

    /**
     * Creates the countries filter.
     * @returns {string} cql - Countries cql filter
     *
     * @private
     * @function createCountriesFilter
     * @memberof Filter(2)
     * @inner
     */
    var createCountriesFilter = function() {
      var cql = "(";

      for(var i = 0; i < memberCountriesBdqNames.length; i++) {
        cql += Utils.getConfigurations().filterConfigurations.LayerToFilter.CountryFieldName + "='" + memberCountriesBdqNames[i] + "' OR ";
      }

      cql = cql.substring(0, cql.length - 4) + ")";

      return cql;
    };

    /**
     * Creates the states filter.
     * @returns {string} cql - States cql filter
     *
     * @private
     * @function createStatesFilter
     * @memberof Filter(2)
     * @inner
     */
    var createStatesFilter = function() {
      var cql = "(";

      for(var i = 0; i < memberStatesBdqNames.length; i++) {
        cql += Utils.getConfigurations().filterConfigurations.LayerToFilter.StateFieldName + "='" + memberStatesBdqNames[i] + "' OR ";
      }

      cql = cql.substring(0, cql.length - 4) + ")";

      return cql;
    };

    /**
     * Applies the dates, the satellites and the biomes filters.
     *
     * @function applyFilter
     * @memberof Filter(2)
     * @inner
     */
    var applyFilter = function() {
      var dates = Utils.getFilterDates(true, 0);

      if(dates !== null) {
        if(dates.length === 0) {
          updateDatesToCurrent();
          var filterDateFrom = getFormattedDateFrom('YYYY/MM/DD');
          var filterDateTo = getFormattedDateTo('YYYY/MM/DD');
        } else {
          var filterDateFrom = dates[0];
          var filterDateTo = dates[1];
        }

        $('#filter-date-from-attributes-table').val(filterDateFrom);
        $('#filter-date-to-attributes-table').val(filterDateTo);

        $('#filter-date-from-graphics').val(filterDateFrom);
        $('#filter-date-to-graphics').val(filterDateTo);

        setSatellites($('#filter-satellite').val());

        $('#filter-satellite-attributes-table').val($('#filter-satellite').val());
        $('#filter-satellite-graphics').val($('#filter-satellite').val());

        setBiomes($('#filter-biome').val());

        $('#filter-biome-attributes-table').val($('#filter-biome').val());
        $('#filter-biome-graphics').val($('#filter-biome').val());

        var cql = "";

        if(filterDateFrom.length > 0 && filterDateTo.length > 0) {
          updateDates(filterDateFrom, filterDateTo, 'YYYY/MM/DD');
          cql += createDateFilter() + " AND ";

          if(Map.getLayers().length > 0) processLayers(Map.getLayers());
        }

        if(!Utils.stringInArray(memberSatellites, "all")) {
          cql += createSatellitesFilter() + " AND ";
        }

        if(!Utils.stringInArray(memberBiomes, "all")) {
          cql += createBiomesFilter() + " AND ";
        }

        if(!Utils.stringInArray(memberCountries, "") && memberCountries.length > 0) {
          cql += createCountriesFilter() + " AND ";
        }

        if(!Utils.stringInArray(memberStates, "") && memberStates.length > 0) {
          cql += createStatesFilter() + " AND ";
        }

        if(cql.length > 5) {
          cql = cql.substring(0, cql.length - 5);
        }

        updateSatellitesSelect();
        TerraMA2WebComponents.MapDisplay.applyCQLFilter(cql, Utils.getConfigurations().filterConfigurations.LayerToFilter.LayerId);
      }

      if(!$('#loading-span').hasClass('hide')) $('#loading-span').addClass('hide');
    };

    /**
     * Checks the number of fires for the current filters.
     *
     * @function checkFiresCount
     * @memberof Filter(2)
     * @inner
     */
    var checkFiresCount = function() {
      if($('#loading-span').hasClass('hide')) $('#loading-span').removeClass('hide');

      var dates = Utils.getFilterDates(true, 0);

      var dateFrom = Utils.dateToString(Utils.stringToDate(dates[0], 'YYYY/MM/DD'), Utils.getConfigurations().firesDateFormat);
      var dateTo = Utils.dateToString(Utils.stringToDate(dates[1], 'YYYY/MM/DD'), Utils.getConfigurations().firesDateFormat);
      var satellites = Utils.stringInArray(getSatellites(), "all") ? '' : getSatellites().toString();
      var biomes = Utils.stringInArray(getBiomes(), "all") ? '' : getBiomes().toString();
      var extent = TerraMA2WebComponents.MapDisplay.getCurrentExtent();
      var countries = (Utils.stringInArray(getCountriesBdqNames(), "") || getCountriesBdqNames().length === 0 ? '' : getCountriesBdqNames().toString());
      var states = (Utils.stringInArray(getStatesBdqNames(), "") || getStatesBdqNames().length === 0 ? '' : getStatesBdqNames().toString());

      Utils.getSocket().emit('checkFiresCountRequest', {
        dateFrom: dateFrom,
        dateTo: dateTo,
        satellites: satellites,
        biomes: biomes,
        extent: extent,
        countries: countries,
        states: states
      });
    };

    /**
     * Processes a list of layers and applies filters to the layers that should be filtered.
     * @param {array} layers - Layers array
     *
     * @private
     * @function processLayers
     * @memberof Filter(2)
     * @inner
     */
    var processLayers = function(layers) {
      $.each(layers, function(j, layer) {
        if(layer.Time !== null) {
          TerraMA2WebComponents.MapDisplay.updateLayerSourceParams(layer.Id, { TIME: Utils.processStringWithDatePattern(layer.Time) }, true);

          var layerName = Utils.applyLayerTimeUpdateButton(layer.Name, layer.Id);
          layerName = Utils.processStringWithDatePattern(layerName);

          $('#' + layer.Id + ' > span.terrama2-layerexplorer-checkbox-span').html(layerName);
          TerraMA2WebComponents.MapDisplay.updateLayerAttribute(layer.Id, 'name', layerName);
        }

        if(layer.Id === Utils.getConfigurations().filterConfigurations.CountriesLayer.Id) {
          if(memberContinent !== null) {
            var cqlFilter = Utils.getConfigurations().filterConfigurations.CountriesLayer.ContinentField + "=" + memberContinent;
            TerraMA2WebComponents.MapDisplay.applyCQLFilter(cqlFilter, layer.Id);
          }
        } else if(layer.Id === Utils.getConfigurations().filterConfigurations.StatesLayer.Id) {
          var cqlFilter = "";

          if(memberCountries.length > 0) {
            for(var count = 0; count < memberCountries.length; count++) {
              cqlFilter += Utils.getConfigurations().filterConfigurations.StatesLayer.CountryField + "=" + memberCountries[count] + " OR ";
            }

            cqlFilter = cqlFilter.substring(0, (cqlFilter.length - 4));
          } else {
            cqlFilter += Utils.getConfigurations().filterConfigurations.StatesLayer.CountryField + "=0";
          }

          TerraMA2WebComponents.MapDisplay.applyCQLFilter(cqlFilter, layer.Id);
        } else if(layer.Id === Utils.getConfigurations().filterConfigurations.CitiesLayer.Id) {
          var cqlFilter = "";

          if(memberStates.length > 0) {
            for(var count = 0; count < memberStates.length; count++) {
              var ids = Utils.getStateIds(memberStates[count]);
              cqlFilter += "(" + Utils.getConfigurations().filterConfigurations.CitiesLayer.CountryField + "=" + ids[0] + " AND " + Utils.getConfigurations().filterConfigurations.CitiesLayer.StateField + "=" + ids[1] + ") OR ";
            }

            cqlFilter = cqlFilter.substring(0, (cqlFilter.length - 4));
          } else {
            cqlFilter += Utils.getConfigurations().filterConfigurations.CitiesLayer.CountryField + "=0 AND " + Utils.getConfigurations().filterConfigurations.CitiesLayer.StateField + "=0";
          }

          TerraMA2WebComponents.MapDisplay.applyCQLFilter(cqlFilter, layer.Id);
        } else if(layer.Id === Utils.getConfigurations().filterConfigurations.CitiesLabelsLayer.Id) {
          var cqlFilter = "";

          if(memberStates.length > 0) {
            for(var count = 0; count < memberStates.length; count++) {
              var ids = Utils.getStateIds(memberStates[count]);
              cqlFilter += "(" + Utils.getConfigurations().filterConfigurations.CitiesLabelsLayer.CountryField + "=" + ids[0] + " AND " + Utils.getConfigurations().filterConfigurations.CitiesLabelsLayer.StateField + "=" + ids[1] + ") OR ";
            }

            cqlFilter = cqlFilter.substring(0, (cqlFilter.length - 4));
          } else {
            cqlFilter += Utils.getConfigurations().filterConfigurations.CitiesLabelsLayer.CountryField + "=0 AND " + Utils.getConfigurations().filterConfigurations.CitiesLabelsLayer.StateField + "=0";
          }

          TerraMA2WebComponents.MapDisplay.applyCQLFilter(cqlFilter, layer.Id);
        } else if(Utils.stringInArray(Utils.getConfigurations().filterConfigurations.CurrentSituationLayers.Layers, layer.Id)) {
          applyCurrentSituationFilter(Utils.dateToString(memberDateFrom, Utils.getConfigurations().filterConfigurations.CurrentSituationLayers.DateFormat), Utils.dateToString(memberDateTo, Utils.getConfigurations().filterConfigurations.CurrentSituationLayers.DateFormat), $('#countries').val(), memberSatellites, memberBiomes, layer.Id);
        }
      });
    };

    /**
     * Applies filters to the current situation layers.
     * @param {int} begin - Initial date
     * @param {int} end - Final date
     * @param {array} countries - Countries ids
     * @param {array} satellites - Satellites
     * @param {array} biomes - Biomes
     * @param {string} layer - Layer id
     *
     * @function applyCurrentSituationFilter
     * @memberof Filter(2)
     * @inner
     */
    var applyCurrentSituationFilter = function(begin, end, countries, satellites, biomes, layer) {
      var currentSituationFilter = "begin:'" + begin + "';end:'" + end + "'";

      if(countries !== undefined && countries !== null && countries !== "" && countries !== '' && countries !== [] && !Utils.stringInArray(countries, "")) {
        currentSituationFilter += ";countries:" + Utils.replaceAll(countries.toString(), ',', '\\,');
      }

      if(satellites !== undefined && satellites !== null && satellites !== "" && satellites !== '' && satellites !== [] && !Utils.stringInArray(satellites, "all")) {
        currentSituationFilter += ";satellites:'" + Utils.replaceAll(satellites.toString(), ',', '\'\\,\'') + "'";
      }

      if(biomes !== undefined && biomes !== null && biomes !== "" && biomes !== '' && biomes !== [] && !Utils.stringInArray(biomes, "all")) {
        currentSituationFilter += ";biomes:'" + Utils.replaceAll(biomes.toString(), ',', '\'\\,\'') + "'";
      }

      TerraMA2WebComponents.MapDisplay.updateLayerSourceParams(layer, { viewparams: currentSituationFilter }, false);
    };

    /**
     * Updates the satellites HTML select.
     *
     * @private
     * @function updateSatellitesSelect
     * @memberof Filter(2)
     * @inner
     */
    var updateSatellitesSelect = function() {
      var selectedOptions = $('#filter-satellite').val();

      var allOption = Utils.stringInArray(selectedOptions, "all") ? "<option value=\"all\" selected>TODOS</option>" : "<option value=\"all\">TODOS</option>";
      var referenceSatellite = "";
      var elem = "";
      var satellitesList = Utils.getConfigurations().filterConfigurations.Satellites;

      $.each(satellitesList, function(i, satelliteItem) {
        var satelliteBegin = new Date();
        var satelliteEnd = new Date();

        var satelliteReferenceBegin = new Date();
        var satelliteReferenceEnd = new Date();

        if(satelliteItem.Begin !== "") {
          var satelliteBeginArray = satelliteItem.Begin.split('-');
          satelliteBegin = new Date(parseInt(satelliteBeginArray[0]), parseInt(satelliteBeginArray[1]) - 1, parseInt(satelliteBeginArray[2]), 0, 0, 0);
        }

        if(satelliteItem.End !== "") {
          var satelliteEndArray = satelliteItem.End.split('-');
          satelliteEnd = new Date(parseInt(satelliteEndArray[0]), parseInt(satelliteEndArray[1]) - 1, parseInt(satelliteEndArray[2]), 0, 0, 0);
        }

        if(satelliteItem.ReferenceBegin !== "") {
          var satelliteReferenceBeginArray = satelliteItem.ReferenceBegin.split('-');
          satelliteReferenceBegin = new Date(parseInt(satelliteReferenceBeginArray[0]), parseInt(satelliteReferenceBeginArray[1]) - 1, parseInt(satelliteReferenceBeginArray[2]), 0, 0, 0);
        }

        if(satelliteItem.ReferenceEnd !== "") {
          var satelliteReferenceEndArray = satelliteItem.ReferenceEnd.split('-');
          satelliteReferenceEnd = new Date(parseInt(satelliteReferenceEndArray[0]), parseInt(satelliteReferenceEndArray[1]) - 1, parseInt(satelliteReferenceEndArray[2]), 0, 0, 0);
        }

        if((satelliteBegin <= memberDateFrom && satelliteEnd >= memberDateTo) || (satelliteBegin <= memberDateFrom && satelliteItem.Current)) {
          if((satelliteReferenceBegin <= memberDateFrom && satelliteReferenceEnd >= memberDateTo) || (satelliteReferenceBegin <= memberDateFrom && satelliteItem.ReferenceCurrent)) {
            if(Utils.stringInArray(selectedOptions, satelliteItem.Id)) {
              referenceSatellite += "<option value=\"" + satelliteItem.Id + "\" selected>Refer&ecirc;ncia</option>";
            } else {
              referenceSatellite += "<option value=\"" + satelliteItem.Id + "\">Refer&ecirc;ncia</option>";
            }
          } else {
            if(Utils.stringInArray(selectedOptions, satelliteItem.Id)) {
              elem += "<option value=\"" + satelliteItem.Id + "\" selected>" + satelliteItem.Name + "</option>";
            } else {
              elem += "<option value=\"" + satelliteItem.Id + "\">" + satelliteItem.Name + "</option>";
            }
          }
        } else if(Utils.stringInArray(selectedOptions, satelliteItem.Id)) {
          elem += "<option value=\"" + satelliteItem.Id + "\" selected>" + satelliteItem.Name + "</option>";
        }
      });

      $('#filter-satellite').empty().html(allOption + referenceSatellite + elem);
    };

    /**
     * Selects a continent in the continent dropdown and fills the countries dropdown.
     * @param {string} id - Continent id
     * @param {string} text - Continent name
     *
     * @function selectContinentItem
     * @memberof Filter(2)
     * @inner
     */
    var selectContinentItem = function(id, text) {
      Utils.getSocket().emit('spatialFilterRequest', { ids: id, key: 'Continent', filterForm: false });
    };

    /**
     * Selects a list of countries in the countries dropdown, selects a continent in the continent dropdown and fills the states dropdown.
     * @param {array} ids - Countries ids
     *
     * @function selectCountries
     * @memberof Filter(2)
     * @inner
     */
    var selectCountries = function(ids) {
      Utils.getSocket().emit('continentByCountryRequest', { country: ids[0] });
      Utils.getSocket().emit('spatialFilterRequest', { ids: ids, key: 'Countries', filterForm: false });
    };

    /**
     * Selects a list of states in the states dropdown, selects a continent in the continent dropdown and selects a list of countries in the countries dropdown.
     * @param {array} ids - States ids
     *
     * @function selectStates
     * @memberof Filter(2)
     * @inner
     */
    var selectStates = function(ids) {
      Utils.getSocket().emit('continentByStateRequest', { state: ids[0] });
      Utils.getSocket().emit('countriesByStatesRequest', { states: ids });
      Utils.getSocket().emit('spatialFilterRequest', { ids: ids, key: 'States', filterForm: false });
    };

    /**
     * Enables a dropdown.
     * @param {string} id - Item HTML id
     * @param {string} itemId - Item id
     *
     * @function enableDropdown
     * @memberof Filter(2)
     * @inner
     */
    var enableDropdown = function(id, itemId) {
      $('#' + id).removeAttr('disabled');
      $('#' + id).val(itemId);
      $('#' + id).attr('data-value', itemId);
    };

    /**
     * Disables a dropdown.
     * @param {string} id - Item HTML id
     * @param {string} itemId - Item id
     *
     * @function disableDropdown
     * @memberof Filter(2)
     * @inner
     */
    var disableDropdown = function(id, itemId) {
      $('#' + id).empty();
      $('#' + id).val(itemId);
      $('#' + id).attr('data-value', itemId);
      $('#' + id).attr('disabled', 'disabled');
    };

    /**
     * Resets the three dropdowns to its initial states.
     *
     * @function resetDropdowns
     * @memberof Filter(2)
     * @inner
     */
    var resetDropdowns = function() {
      enableDropdown('continents', '');
      disableDropdown('countries', '');
      $('#countries').empty();
      disableDropdown('states', '');
      $('#states').empty();
    };

    /**
     * Initializes the necessary features.
     *
     * @function init
     * @memberof Filter(2)
     * @inner
     */
    var init = function() {
      $(document).ready(function() {
        updateDatesToCurrent();
        Utils.getSocket().emit('spatialFilterRequest', { ids: Utils.getConfigurations().applicationConfigurations.InitialContinentToFilter, key: 'Continent', filterForm: false });
      });
    };

    return {
      getFormattedDateFrom: getFormattedDateFrom,
      getFormattedDateTo: getFormattedDateTo,
      setSatellites: setSatellites,
      getSatellites: getSatellites,
      setBiomes: setBiomes,
      getBiomes: getBiomes,
      setContinent: setContinent,
      getContinent: getContinent,
      setCountries: setCountries,
      getCountries: getCountries,
      setCountriesBdqNames: setCountriesBdqNames,
      updateCountriesBdqNames: updateCountriesBdqNames,
      getCountriesBdqNames: getCountriesBdqNames,
      clearCountries: clearCountries,
      setStates: setStates,
      getStates: getStates,
      setStatesBdqNames: setStatesBdqNames,
      updateStatesBdqNames: updateStatesBdqNames,
      getStatesBdqNames: getStatesBdqNames,
      clearStates: clearStates,
      updateBdqNames: updateBdqNames,
      updateDates: updateDates,
      updateDatesToCurrent: updateDatesToCurrent,
      applyFilter: applyFilter,
      checkFiresCount: checkFiresCount,
      applyCurrentSituationFilter: applyCurrentSituationFilter,
      selectContinentItem: selectContinentItem,
      selectCountries: selectCountries,
      selectStates: selectStates,
      enableDropdown: enableDropdown,
      disableDropdown: disableDropdown,
      resetDropdowns: resetDropdowns,
      init: init
    };
  }
);
