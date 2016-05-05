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
 * @property {string} memberSatellite - Current satellite.
 */
define(
  ['components/Utils'],
  function(Utils) {

    // Current initial date
    var memberDateFrom = null;
    // Current final date
    var memberDateTo = null;
    // Current satellite
    var memberSatellite = "all";

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
     * Sets the satellite.
     * @param {string} satellite - Satellite
     *
     * @function setSatellite
     * @memberof Filter(2)
     * @inner
     */
    var setSatellite = function(satellite) {
      memberSatellite = satellite;
    };

    /**
     * Returns the satellite.
     * @returns {string} memberSatellite - Satellite
     *
     * @function getSatellite
     * @memberof Filter(2)
     * @inner
     */
    var getSatellite = function() {
      return memberSatellite;
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

      $('#filter-date-from').val(Utils.dateToString(memberDateFrom, 'DD/MM/YYYY'));
      $('#filter-date-to').val(Utils.dateToString(memberDateTo, 'DD/MM/YYYY'));
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
    };

    /**
     * Creates the satellite filter.
     * @returns {string} cql - Satellite cql filter
     *
     * @private
     * @function createSatelliteFilter
     * @memberof Filter(2)
     * @inner
     */
    var createSatelliteFilter = function() {
      var cql = Utils.getConfigurations().filterConfigurations.LayerToFilter.SatelliteFieldName + "='" + memberSatellite + "'";
      return cql;
    };

    /**
     * Applies the dates and the satellite filters.
     * @param {string} filterDateFrom - Filtered initial date
     * @param {string} filterDateTo - Filtered final date
     * @param {string} filterSatellite - Filtered satellite
     *
     * @function applyFilter
     * @memberof Filter(2)
     * @inner
     */
    var applyFilter = function(filterDateFrom, filterDateTo, filterSatellite) {
      var cql = "";

      if(filterDateFrom.length > 0 && filterDateTo.length > 0) {
        updateDates(filterDateFrom, filterDateTo, 'DD/MM/YYYY');
        cql += createDateFilter();

        $.each(Utils.getConfigurations().filterConfigurations.CurrentSituationLayers.Layers, function(i, layer) {
          applyCurrentSituationFilter(Utils.dateToString(memberDateFrom, 'YYYYMMDD'), Utils.dateToString(memberDateTo, 'YYYYMMDD'), $('#countries-title').attr('item-id'), memberSatellite, layer);
        });
      }

      if(filterDateFrom.length > 0 && filterDateTo.length > 0 && filterSatellite !== "all")
        cql += " AND ";

      if(filterSatellite !== "all")
        cql += createSatelliteFilter();

      updateSatelliteSelect();
      TerraMA2WebComponents.MapDisplay.applyCQLFilter(cql, Utils.getConfigurations().filterConfigurations.LayerToFilter.LayerId);
    };

    /**
     * Applies filters to the current situation layers.
     * @param {int} begin - Initial date
     * @param {int} end - Final date
     * @param {string} country - Country id
     * @param {string} satellite - Satellite
     * @param {string} layer - Layer id
     *
     * @function applyCurrentSituationFilter
     * @memberof Filter(2)
     * @inner
     */
    var applyCurrentSituationFilter = function(begin, end, country, satellite, layer) {
      var currentSituationFilter = "begin:" + begin + ";end:" + end;

      if(country !== undefined && country !== null && country !== "" && country !== '') currentSituationFilter += ";country:" + country;
      if(satellite !== undefined && satellite !== null && satellite !== "" && satellite !== '' && satellite !== "all") currentSituationFilter += ";satellite:" + satellite;

      TerraMA2WebComponents.MapDisplay.updateLayerSourceParams(layer, { viewparams: currentSituationFilter });
    };

    /**
     * Updates the satellite HTML select.
     *
     * @private
     * @function updateSatelliteSelect
     * @memberof Filter(2)
     * @inner
     */
    var updateSatelliteSelect = function() {
      var selectedOption = $('#filter-satellite').value;

      var elem = "<option value=\"all\">TODOS</option>";
      var satellitesList = Utils.getConfigurations().filterConfigurations.Satellites;

      $.each(satellitesList, function(i, satelliteItem) {
        var satelliteBegin = new Date(satelliteItem.Begin + ' UTC-03:00');
        var satelliteEnd = new Date(satelliteItem.End + ' UTC-03:00');

        satelliteBegin.setHours(0,0,0,0);
        satelliteEnd.setHours(0,0,0,0);

        if((satelliteBegin <= memberDateFrom && satelliteEnd >= memberDateTo) || (satelliteBegin <= memberDateFrom && satelliteItem.Current)) {
          if(memberSatellite === satelliteItem.Name) {
            elem += "<option value=\"" + satelliteItem.Name + "\" selected>" + satelliteItem.Name + "</option>";
          } else {
            elem += "<option value=\"" + satelliteItem.Name + "\">" + satelliteItem.Name + "</option>";
          }
        } else if(memberSatellite === satelliteItem.Name) {
          elem += "<option value=\"" + satelliteItem.Name + "\" selected>" + satelliteItem.Name + "</option>";
        }
      });

      $('#filter-satellite').empty().html(elem);
    };

    /**
     * Selects a continent in the continent dropdown and fills the country dropdown.
     * @param {string} id - Continent id
     * @param {string} text - Continent name
     *
     * @function selectContinentItem
     * @memberof Filter(2)
     * @inner
     */
    var selectContinentItem = function(id, text) {
      Utils.getSocket().emit('spatialFilterRequest', { id: id, text: text, key: 'Continent' });
    };

    /**
     * Selects a country in the country dropdown, selects a continent in the continent dropdown and fills the state dropdown.
     * @param {string} id - Country id
     * @param {string} text - Country name
     *
     * @function selectCountryItem
     * @memberof Filter(2)
     * @inner
     */
    var selectCountryItem = function(id, text) {
      Utils.getSocket().emit('continentByCountryRequest', { country: id });
      Utils.getSocket().emit('spatialFilterRequest', { id: id, text: text, key: 'Country' });
    };

    /**
     * Selects a state in the state dropdown, selects a continent in the continent dropdown and selects a country in the country dropdown.
     * @param {string} id - State id
     * @param {string} text - State name
     *
     * @function selectStateItem
     * @memberof Filter(2)
     * @inner
     */
    var selectStateItem = function(id, text) {
      Utils.getSocket().emit('continentByStateRequest', { state: id });
      Utils.getSocket().emit('countryByStateRequest', { state: id });
      Utils.getSocket().emit('spatialFilterRequest', { id: id, text: text, key: 'State' });
    };

    /**
     * Enables a dropdown.
     * @param {string} id - Item HTML id
     * @param {string} text - Item name
     * @param {string} itemId - Item id
     *
     * @function enableDropdown
     * @memberof Filter(2)
     * @inner
     */
    var enableDropdown = function(id, text, itemId) {
      $('#' + id + '-title').empty().html(text);
      $('#' + id + '-title').attr("item-id", itemId);
      $('#' + id + '-dropdown').removeClass('open');
      $('#' + id + '-dropdown').removeClass('dropdown-closed');
    };

    /**
     * Disables a dropdown.
     * @param {string} id - Item HTML id
     * @param {string} text - Item name
     * @param {string} itemId - Item id
     *
     * @function disableDropdown
     * @memberof Filter(2)
     * @inner
     */
    var disableDropdown = function(id, text, itemId) {
      $('#' + id + '-title').empty().html(text);
      $('#' + id + '-title').attr("item-id", itemId);
      $('#' + id + '-dropdown').removeClass('open');
      if(!$('#' + id + '-dropdown').hasClass('dropdown-closed')) $('#' + id + '-dropdown').addClass('dropdown-closed');
    };

    /**
     * Resets the three dropdowns to its initial states.
     *
     * @function resetDropdowns
     * @memberof Filter(2)
     * @inner
     */
    var resetDropdowns = function() {
      enableDropdown('continents', 'Continentes', '');
      disableDropdown('countries', 'Pa&iacute;ses', '');
      $('#countries').empty();
      disableDropdown('states', 'Estados', '');
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
        Utils.getSocket().emit('spatialFilterRequest', { id: "South America", text: "South America", key: 'Continent' });
      });
    };

    return {
      getFormattedDateFrom: getFormattedDateFrom,
      getFormattedDateTo: getFormattedDateTo,
      setSatellite: setSatellite,
      getSatellite: getSatellite,
      updateDates: updateDates,
      updateDatesToCurrent: updateDatesToCurrent,
      applyFilter: applyFilter,
      applyCurrentSituationFilter: applyCurrentSituationFilter,
      selectContinentItem: selectContinentItem,
      selectCountryItem: selectCountryItem,
      selectStateItem: selectStateItem,
      enableDropdown: enableDropdown,
      disableDropdown: disableDropdown,
      resetDropdowns: resetDropdowns,
      init: init
    };
  }
);
