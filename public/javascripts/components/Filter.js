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
BDQueimadas.components.Filter = (function() {

  // Current initial date
  var memberDateFrom = null;
  // Current final date
  var memberDateTo = null;
  // Current satellite
  var memberSatellite = "all";

  /**
   * Returns the initial date formatted with the received format.
   * @param {string} format - Format
   * @returns {string} BDQueimadas.components.Utils.dateToString() - Formatted initial date (string)
   *
   * @function getFormattedDateFrom
   * @memberof Filter(2)
   * @inner
   */
  var getFormattedDateFrom = function(format) {
    return BDQueimadas.components.Utils.dateToString(memberDateFrom, format);
  };

  /**
   * Returns the final date formatted with the received format.
   * @param {string} format - Format
   * @returns {string} BDQueimadas.components.Utils.dateToString() - Formatted final date (string)
   *
   * @function getFormattedDateTo
   * @memberof Filter(2)
   * @inner
   */
  var getFormattedDateTo = function(format) {
    return BDQueimadas.components.Utils.dateToString(memberDateTo, format);
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
    var cql = BDQueimadas.obj.getFilterConfig().LayerToFilter.DateFieldName + ">=" + BDQueimadas.components.Utils.dateToString(memberDateFrom, BDQueimadas.obj.getFilterConfig().LayerToFilter.DateFormat);
    cql += " and ";
    cql += BDQueimadas.obj.getFilterConfig().LayerToFilter.DateFieldName + "<=" + BDQueimadas.components.Utils.dateToString(memberDateTo, BDQueimadas.obj.getFilterConfig().LayerToFilter.DateFormat);

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
    memberDateFrom = BDQueimadas.components.Utils.stringToDate(newDateFrom, format);
    memberDateTo = BDQueimadas.components.Utils.stringToDate(newDateTo, format);

    memberDateFrom.setHours(0,0,0,0);
    memberDateTo.setHours(0,0,0,0);

    $('#filter-date-from').val(BDQueimadas.components.Utils.dateToString(memberDateFrom, 'DD/MM/YYYY'));
    $('#filter-date-to').val(BDQueimadas.components.Utils.dateToString(memberDateTo, 'DD/MM/YYYY'));
  };

  /**
   * Updates the initial and the final date to the current date.
   *
   * @private
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
    var cql = BDQueimadas.obj.getFilterConfig().LayerToFilter.SatelliteFieldName + "='" + memberSatellite + "'";
    return cql;
  };

  /**
   * Applies the dates and the satellite filters.
   * @param {string} filterDateFrom - Filtered initial date
   * @param {string} filterDateTo - Filtered final date
   * @param {string} filterSatellite - Filtered satellite
   *
   * @private
   * @function applyFilter
   * @memberof Filter(2)
   * @inner
   */
  var applyFilter = function(filterDateFrom, filterDateTo, filterSatellite) {
    var cql = "";

    if(filterDateFrom.length > 0 && filterDateTo.length > 0) {
      updateDates(filterDateFrom, filterDateTo, 'DD/MM/YYYY');
      cql += createDateFilter();
    }

    if(filterDateFrom.length > 0 && filterDateTo.length > 0 && filterSatellite !== "all")
      cql += " AND ";

    if(filterSatellite !== "all")
      cql += createSatelliteFilter();

    updateSatelliteSelect();

    BDQueimadas.components.AttributesTable.updateAttributesTable();

    TerraMA2WebComponents.webcomponents.MapDisplay.applyCQLFilter(cql, BDQueimadas.obj.getFilterConfig().LayerToFilter.LayerId);

    BDQueimadas.components.Graphics.updateFiresCountBySatelliteGraphic();
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
    var satellitesList = BDQueimadas.obj.getFilterConfig().Satellites;

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
   * Loads the DOM events.
   *
   * @private
   * @function loadEvents
   * @memberof Filter(2)
   * @inner
   */
  var loadEvents = function() {
    $('#filter-button').on('click', function(el) {
      var filterDateFrom = $('#filter-date-from').val();
      var filterDateTo = $('#filter-date-to').val();
      memberSatellite = $('#filter-satellite').val();

      if((filterDateFrom.length > 0 && filterDateTo.length > 0) || (filterDateFrom.length === 0 && filterDateTo.length === 0)) {
        if(filterDateFrom.length === 0 && filterDateTo.length === 0) {
          updateDatesToCurrent();
          filterDateTo = getFormattedDateTo('DD/MM/YYYY');
          filterDateFrom = getFormattedDateFrom('DD/MM/YYYY');
        }

        applyFilter(filterDateFrom, filterDateTo, memberSatellite);
      } else {
        if(filterDateFrom.length === 0) {
          $("#filter-date-from").parent(":not([class*='has-error'])").addClass('has-error');
        }
        if(filterDateTo.length === 0) {
          $("#filter-date-to").parent(":not([class*='has-error'])").addClass('has-error');
        }
      }
    });

    $('.continent-item').on('click', function() {
      BDQueimadas.obj.getSocket().emit('spatialFilterRequest', { id: $(this).attr('id'), text: $(this).text(), key: 'Continent' });
    });

    $(document).on('click', '.country-item', function() {
      BDQueimadas.obj.getSocket().emit('spatialFilterRequest', { id: $(this).attr('id'), text: $(this).text(), key: 'Country' });
    });

    $(document).on('click', '.state-item', function() {
      BDQueimadas.obj.getSocket().emit('spatialFilterRequest', { id: $(this).attr('id'), text: $(this).text(), key: 'State' });
    });

    $('.filter-date').on('focus', function(el) {
      if($(this).parent().hasClass('has-error')) {
        $(this).parent().removeClass('has-error');
      }
    });
  };

  /**
   * Selects a continent in the continent dropdown and fills the country dropdown.
   * @param {string} id - Continent id
   * @param {string} text - Continent name
   *
   * @private
   * @function selectContinentItem
   * @memberof Filter(2)
   * @inner
   */
  var selectContinentItem = function(id, text) {
    BDQueimadas.obj.getSocket().emit('spatialFilterRequest', { id: id, text: text, key: 'Continent' });
  };

  /**
   * Selects a country in the country dropdown, selects a continent in the continent dropdown and fills the state dropdown.
   * @param {string} id - Country id
   * @param {string} text - Country name
   *
   * @private
   * @function selectCountryItem
   * @memberof Filter(2)
   * @inner
   */
  var selectCountryItem = function(id, text) {
    BDQueimadas.obj.getSocket().emit('continentByCountryRequest', { country: id });
    BDQueimadas.obj.getSocket().emit('spatialFilterRequest', { id: id, text: text, key: 'Country' });
  };

  /**
   * Selects a state in the state dropdown, selects a continent in the continent dropdown and selects a country in the country dropdown.
   * @param {string} id - State id
   * @param {string} text - State name
   *
   * @private
   * @function selectStateItem
   * @memberof Filter(2)
   * @inner
   */
  var selectStateItem = function(id, text) {
    BDQueimadas.obj.getSocket().emit('continentByStateRequest', { state: id });
    BDQueimadas.obj.getSocket().emit('countryByStateRequest', { state: id });
    BDQueimadas.obj.getSocket().emit('spatialFilterRequest', { id: id, text: text, key: 'State' });
  };

  /**
   * Enables a dropdown.
   * @param {string} id - Item id
   * @param {string} text - Item name
   *
   * @private
   * @function enableDropdown
   * @memberof Filter(2)
   * @inner
   */
  var enableDropdown = function(id, text) {
    $('#' + id + '-title').empty().html(text);
    $('#' + id + '-dropdown').removeClass('open');
    $('#' + id + '-dropdown').removeClass('dropdown-closed');
  };

  /**
   * Disables a dropdown.
   * @param {string} id - Item id
   * @param {string} text - Item name
   *
   * @private
   * @function disableDropdown
   * @memberof Filter(2)
   * @inner
   */
  var disableDropdown = function(id, text) {
    $('#' + id + '-title').empty().html(text);
    $('#' + id + '-dropdown').removeClass('open');
    if(!$('#' + id + '-dropdown').hasClass('dropdown-closed')) $('#' + id + '-dropdown').addClass('dropdown-closed');
  };

  /**
   * Resets the three dropdowns to its initial states.
   *
   * @private
   * @function resetDropdowns
   * @memberof Filter(2)
   * @inner
   */
  var resetDropdowns = function() {
    enableDropdown('continents', "Continentes");
    disableDropdown('countries', 'Pa&iacute;ses');
    $('#countries').empty();
    disableDropdown('states', 'Estados');
    $('#states').empty();
  };

  /**
   * Loads the sockets listeners.
   *
   * @private
   * @function loadSocketsListeners
   * @memberof Filter(2)
   * @inner
   */
  var loadSocketsListeners = function() {
    BDQueimadas.obj.getSocket().on('spatialFilterResponse', function(result) {
      if(result.key === 'Continent') {
        var extent = result.extent.rows[0].extent.replace('BOX(', '').replace(')', '').split(',');
        var extentArray = extent[0].split(' ');
        extentArray = extentArray.concat(extent[1].split(' '));

        TerraMA2WebComponents.webcomponents.MapDisplay.zoomToExtent(extentArray);
        BDQueimadas.components.AttributesTable.updateAttributesTable();
        BDQueimadas.obj.getSocket().emit('countriesByContinentRequest', { continent: result.id });

        enableDropdown('continents', result.text);
        enableDropdown('countries', 'Pa&iacute;ses');
        disableDropdown('states', 'Estados');
      } else if(result.key === 'Country') {
        var extent = result.extent.rows[0].extent.replace('BOX(', '').replace(')', '').split(',');
        var extentArray = extent[0].split(' ');
        extentArray = extentArray.concat(extent[1].split(' '));

        TerraMA2WebComponents.webcomponents.MapDisplay.zoomToExtent(extentArray);
        BDQueimadas.components.AttributesTable.updateAttributesTable();
        BDQueimadas.obj.getSocket().emit('statesByCountryRequest', { country: result.id });

        enableDropdown('countries', result.text);
        enableDropdown('states', 'Estados');
      } else {
        var extent = result.extent.rows[0].extent.replace('BOX(', '').replace(')', '').split(',');
        var extentArray = extent[0].split(' ');
        extentArray = extentArray.concat(extent[1].split(' '));

        TerraMA2WebComponents.webcomponents.MapDisplay.zoomToExtent(extentArray);
        BDQueimadas.components.AttributesTable.updateAttributesTable();

        enableDropdown('states', result.text);
      }

      BDQueimadas.components.Graphics.updateFiresCountBySatelliteGraphic();
    });

    BDQueimadas.obj.getSocket().on('extentByIntersectionResponse', function(result) {
      if(result.extent.rowCount > 0 && result.extent.rows[0].extent !== null) {
        var extent = result.extent.rows[0].extent.replace('BOX(', '').replace(')', '').split(',');
        var extentArray = extent[0].split(' ');
        extentArray = extentArray.concat(extent[1].split(' '));

        TerraMA2WebComponents.webcomponents.MapDisplay.zoomToExtent(extentArray);

        if(result.extent.rows[0].key === "States") {
          selectStateItem(result.extent.rows[0].id, result.extent.rows[0].name);
        } else if(result.extent.rows[0].key === "Countries") {
          selectCountryItem(result.extent.rows[0].id, result.extent.rows[0].name);
        } else {
          selectContinentItem(result.extent.rows[0].id, result.extent.rows[0].name);
        }
      } else {
        TerraMA2WebComponents.webcomponents.MapDisplay.zoomToInitialExtent();
      }

      BDQueimadas.components.AttributesTable.updateAttributesTable();

      BDQueimadas.components.Graphics.updateFiresCountBySatelliteGraphic();
    });

    BDQueimadas.obj.getSocket().on('continentByCountryResponse', function(result) {
      $('#continents-title').empty().html(result.continent.rows[0].name);

      BDQueimadas.obj.getSocket().emit('countriesByContinentRequest', { continent: result.continent.rows[0].id });
    });

    BDQueimadas.obj.getSocket().on('continentByStateResponse', function(result) {
      $('#continents-title').empty().html(result.continent.rows[0].name);
    });

    BDQueimadas.obj.getSocket().on('countryByStateResponse', function(result) {
      $('#countries-title').empty().html(result.country.rows[0].name);

      BDQueimadas.obj.getSocket().emit('statesByCountryRequest', { country: result.country.rows[0].id });
    });

    BDQueimadas.obj.getSocket().on('countriesByContinentResponse', function(result) {
      var html = "",
          countriesCount = result.countries.rowCount;

      for(var i = 0; i < countriesCount; i++) {
        html += "<li class='country-item' id='" + result.countries.rows[i].id + "'><a href='#'>" + result.countries.rows[i].name + "</a></li>";
      }

      $('#countries').empty().html(html);
    });

    BDQueimadas.obj.getSocket().on('statesByCountryResponse', function(result) {
      var html = "",
          statesCount = result.states.rowCount;

      for(var i = 0; i < statesCount; i++) {
        html += "<li class='state-item' id='" + result.states.rows[i].id + "'><a href='#'>" + result.states.rows[i].name + "</a></li>";
      }

      $('#states').empty().html(html);
    });
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
      loadEvents();
      loadSocketsListeners();
    });
  };

  return {
    getFormattedDateFrom: getFormattedDateFrom,
    getFormattedDateTo: getFormattedDateTo,
    getSatellite: getSatellite,
    resetDropdowns: resetDropdowns,
    updateDates: updateDates,
    init: init
  };
})();
