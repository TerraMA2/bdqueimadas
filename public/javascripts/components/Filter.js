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
 * @property {string} memberContinent - Current continent.
 * @property {array} memberCountries - Current countries.
 * @property {array} memberCountriesBdqNames - Current countries BDQ names.
 * @property {array} memberStates - Current states.
 * @property {array} memberStatesBdqNames - Current states BDQ names.
 */
define(
  ['components/Utils', 'TerraMA2WebComponents'],
  function(Utils, TerraMA2WebComponents) {

    // Current initial date
    var memberDateFrom = null;
    // Current final date
    var memberDateTo = null;
    // Current satellites
    var memberSatellites = ["all"];
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
     * @param {string} satellites - Satellites array
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
     * @returns {string} memberSatellites - Satellites array
     *
     * @function getSatellites
     * @memberof Filter(2)
     * @inner
     */
    var getSatellites = function() {
      return memberSatellites;
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
     * Applies the dates and the satellites filters.
     * @param {string} filterDateFrom - Filtered initial date
     * @param {string} filterDateTo - Filtered final date
     * @param {string} filterSatellites - Filtered satellites
     *
     * @function applyFilter
     * @memberof Filter(2)
     * @inner
     */
    var applyFilter = function(filterDateFrom, filterDateTo, filterSatellites) {
      var cql = "";

      if(filterDateFrom.length > 0 && filterDateTo.length > 0) {
        updateDates(filterDateFrom, filterDateTo, 'YYYY/MM/DD');
        cql += createDateFilter() + " AND ";

        $.each(Utils.getConfigurations().filterConfigurations.CurrentSituationLayers.Layers, function(i, layer) {
          applyCurrentSituationFilter(Utils.dateToString(memberDateFrom, Utils.getConfigurations().filterConfigurations.CurrentSituationLayers.DateFormat), Utils.dateToString(memberDateTo, Utils.getConfigurations().filterConfigurations.CurrentSituationLayers.DateFormat), $('#countries').val(), memberSatellites, layer);
        });

        if(Utils.getConfigurations().mapConfigurations.LayerGroups.length > 0) {
          $.each(Utils.getConfigurations().mapConfigurations.LayerGroups, function(i, layerGroup) {
            $.each(layerGroup.Layers, function (j, layer) {
              if(layer.Time !== null) {
                TerraMA2WebComponents.MapDisplay.updateLayerSourceParams(layer.Id, { TIME: Utils.processStringWithDatePattern(layer.Time) }, true);

                var layerName = Utils.processStringWithDatePattern(layer.Name);

                $('#' + layer.Id + ' > span.terrama2-layerexplorer-checkbox-span').text(layerName);
                TerraMA2WebComponents.MapDisplay.updateLayerAttribute(layer.Id, 'name', layerName);
              }
            });
          });
        } else if(Utils.getConfigurations().mapConfigurations.Layers.length > 0) {
          $.each(Utils.getConfigurations().mapConfigurations.Layers, function (j, layer) {
            if(layer.Time !== null) {
              TerraMA2WebComponents.MapDisplay.updateLayerSourceParams(layer.Id, { TIME: Utils.processStringWithDatePattern(layer.Time) }, true);

              var layerName = Utils.processStringWithDatePattern(layer.Name);

              $('#' + layer.Id + ' > span.terrama2-layerexplorer-checkbox-span').text(layerName);
              TerraMA2WebComponents.MapDisplay.updateLayerAttribute(layer.Id, 'name', layerName);
            }
          });
        }
      }

      if(!Utils.stringInArray(filterSatellites, "all")) {
        cql += createSatellitesFilter() + " AND ";
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
    };

    /**
     * Applies filters to the current situation layers.
     * @param {int} begin - Initial date
     * @param {int} end - Final date
     * @param {array} countries - Countries ids
     * @param {array} satellites - Satellites
     * @param {string} layer - Layer id
     *
     * @function applyCurrentSituationFilter
     * @memberof Filter(2)
     * @inner
     */
    var applyCurrentSituationFilter = function(begin, end, countries, satellites, layer) {
      var currentSituationFilter = "begin:" + begin + ";end:" + end;

      if(countries !== undefined && countries !== null && countries !== "" && countries !== '' && countries !== [] && !Utils.stringInArray(countries, "")) currentSituationFilter += ";countries:" + countries.toString();
      if(satellites !== undefined && satellites !== null && satellites !== "" && satellites !== '' && satellites !== [] && !Utils.stringInArray(satellites, "all")) currentSituationFilter += ";satellites:" + satellites.toString();

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

      var elem = Utils.stringInArray(selectedOptions, "all") ? "<option value=\"all\" selected>TODOS</option>" : "<option value=\"all\">TODOS</option>";
      var satellitesList = Utils.getConfigurations().filterConfigurations.Satellites;

      $.each(satellitesList, function(i, satelliteItem) {
        var satelliteBegin = new Date();
        var satelliteEnd = new Date();

        if(satelliteItem.Begin !== "") {
          var satelliteBeginArray = satelliteItem.Begin.split('-');
          satelliteBegin = new Date(parseInt(satelliteBeginArray[0]), parseInt(satelliteBeginArray[1]) - 1, parseInt(satelliteBeginArray[2]), 0, 0, 0);
        }

        if(satelliteItem.End !== "") {
          var satelliteEndArray = satelliteItem.End.split('-');
          satelliteEnd = new Date(parseInt(satelliteEndArray[0]), parseInt(satelliteEndArray[1]) - 1, parseInt(satelliteEndArray[2]), 0, 0, 0);
        }

        if((satelliteBegin <= memberDateFrom && satelliteEnd >= memberDateTo) || (satelliteBegin <= memberDateFrom && satelliteItem.Current)) {
          if(Utils.stringInArray(selectedOptions, satelliteItem.Name)) {
            elem += "<option value=\"" + satelliteItem.Name + "\" selected>" + satelliteItem.Name + "</option>";
          } else {
            elem += "<option value=\"" + satelliteItem.Name + "\">" + satelliteItem.Name + "</option>";
          }
        } else if(Utils.stringInArray(selectedOptions, satelliteItem.Name)) {
          elem += "<option value=\"" + satelliteItem.Name + "\" selected>" + satelliteItem.Name + "</option>";
        }
      });

      $('#filter-satellite').empty().html(elem);
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
      setContinent: setContinent,
      getContinent: getContinent,
      setCountries: setCountries,
      getCountries: getCountries,
      setCountriesBdqNames: setCountriesBdqNames,
      getCountriesBdqNames: getCountriesBdqNames,
      clearCountries: clearCountries,
      setStates: setStates,
      getStates: getStates,
      setStatesBdqNames: setStatesBdqNames,
      getStatesBdqNames: getStatesBdqNames,
      clearStates: clearStates,
      updateDates: updateDates,
      updateDatesToCurrent: updateDatesToCurrent,
      applyFilter: applyFilter,
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
