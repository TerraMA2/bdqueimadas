"use strict";

/**
 * Filter class of the BDQueimadas.
 * @module Filter
 *
 * @property {date} dateFrom - Current initial date.
 * @property {date} dateTo - Current final date.
 * @property {string} satellite - Current satellite.
 */
BDQueimadas.components.Filter = (function() {

  // Current initial date
  var dateFrom = null;
  // Current final date
  var dateTo = null;
  // Current satellite
  var satellite = "all";

  /**
   * Returns the initial date formatted with the received format.
   * @param {string} format - Format
   * @returns {string} dateToString() - Formatted initial date (string)
   *
   * @function getFormattedDateFrom
   */
  var getFormattedDateFrom = function(format) {
    return dateToString(dateFrom, format);
  };

  /**
   * Returns the final date formatted with the received format.
   * @param {string} format - Format
   * @returns {string} dateToString() - Formatted final date (string)
   *
   * @function getFormattedDateTo
   */
  var getFormattedDateTo = function(format) {
    return dateToString(dateTo, format);
  };

  /**
   * Returns the satellite.
   * @returns {string} satellite - Satellite
   *
   * @function getSatellite
   */
  var getSatellite = function() {
    return satellite;
  };

  /**
   * Converts a date into a string date formatted accordingly with the received format.
   * @param {date} date - Date to be formatted
   * @param {string} format - Format
   * @returns {string} stringDate - Formatted string date
   *
   * @private
   * @function dateToString
   */
  var dateToString = function(date, format) {
    var stringDate = format;

    var dd = ('0' + date.getDate()).slice(-2);
    var mm = ('0' + (date.getMonth() + 1)).slice(-2);
    var yyyy = date.getFullYear().toString();

    if(format.match(/YYYY/)) stringDate = stringDate.replace("YYYY", yyyy);
    if(format.match(/MM/)) stringDate = stringDate.replace("MM", mm);
    if(format.match(/DD/)) stringDate = stringDate.replace("DD", dd);

    return stringDate;
  };

  /**
   * Creates the date filter.
   * @returns {string} cql - Date cql filter
   *
   * @private
   * @function createDateFilter
   */
  var createDateFilter = function() {
    var cql = BDQueimadas.obj.getFilterConfig().DateFieldName + ">=" + dateToString(dateFrom, BDQueimadas.obj.getFilterConfig().DateFormat);
    cql += " and ";
    cql += BDQueimadas.obj.getFilterConfig().DateFieldName + "<=" + dateToString(dateTo, BDQueimadas.obj.getFilterConfig().DateFormat);

    return cql;
  };

  /**
   * Updates the initial and the final date.
   * @param {string} newDateFrom - New initial date (string)
   * @param {string} newDateTo - New final date (string)
   *
   * @private
   * @function updateDates
   */
  var updateDates = function(newDateFrom, newDateTo) {
    var dateFromSplited = newDateFrom.split("/");
    var dateToSplited = newDateTo.split("/");

    dateFrom = new Date(dateFromSplited[2] + '-' + dateFromSplited[1] + '-' + dateFromSplited[0] + ' UTC-03:00');
    dateTo = new Date(dateToSplited[2] + '-' + dateToSplited[1] + '-' + dateToSplited[0] + ' UTC-03:00');

    dateFrom.setHours(0,0,0,0);
    dateTo.setHours(0,0,0,0);
  };

  /**
   * Updates the initial and the final date to the current date.
   *
   * @private
   * @function updateDatesToCurrent
   */
  var updateDatesToCurrent = function() {
    dateFrom = new Date();
    dateTo = new Date();
    dateFrom.setHours(dateFrom.getHours() - 24);

    dateFrom.setHours(0,0,0,0);
    dateTo.setHours(0,0,0,0);
  };

  /**
   * Creates the satellite filter.
   * @returns {string} cql - Satellite cql filter
   *
   * @private
   * @function createSatelliteFilter
   */
  var createSatelliteFilter = function() {
    var cql = BDQueimadas.obj.getFilterConfig().SatelliteFieldName + "='" + satellite + "'";
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
   */
  var applyFilter = function(filterDateFrom, filterDateTo, filterSatellite) {
    var cql = "";

    if(filterDateFrom.length > 0 && filterDateTo.length > 0) {
      updateDates(filterDateFrom, filterDateTo);
      cql += createDateFilter();
    }

    if(filterDateFrom.length > 0 && filterDateTo.length > 0 && filterSatellite !== "all")
      cql += " AND ";

    if(filterSatellite !== "all")
      cql += createSatelliteFilter();

    updateSatelliteSelect();

    BDQueimadas.components.AttributesTable.updateAttributesTable();

    TerraMA2WebComponents.webcomponents.MapDisplay.applyCQLFilter(cql, BDQueimadas.obj.getFilterConfig().LayerToFilter);
  };

  /**
   * Updates the satellite HTML select.
   *
   * @private
   * @function updateSatelliteSelect
   */
  var updateSatelliteSelect = function() {
    var selectedOption = $('#filter-satellite').value;

    var elem = "<option value=\"all\">TODOS</option>";
    var satellitesList = BDQueimadas.obj.getFilterConfig().SatellitesList;

    $.each(satellitesList, function(i, _satellite) {
      var satelliteBegin = new Date(_satellite.Begin + ' UTC-03:00');
      var satelliteEnd = new Date(_satellite.End + ' UTC-03:00');

      satelliteBegin.setHours(0,0,0,0);
      satelliteEnd.setHours(0,0,0,0);

      if((satelliteBegin <= dateFrom && satelliteEnd >= dateTo) || (satelliteBegin <= dateFrom && _satellite.Current)) {
        if(satellite === _satellite.Name) {
          elem += "<option value=\"" + _satellite.Name + "\" selected>" + _satellite.Name + "</option>";
        } else {
          elem += "<option value=\"" + _satellite.Name + "\">" + _satellite.Name + "</option>";
        }
      } else if(satellite === _satellite.Name) {
        elem += "<option value=\"" + _satellite.Name + "\" selected>" + _satellite.Name + "</option>";
      }
    });

    $('#filter-satellite').empty().html(elem);
  };

  /**
   * Loads the DOM events.
   *
   * @private
   * @function loadEvents
   */
  var loadEvents = function() {
    $('#filter-button').on('click', function(el) {
      var filterDateFrom = $('#filter-date-from').val();
      var filterDateTo = $('#filter-date-to').val();
      satellite = $('#filter-satellite').val();

      if((filterDateFrom.length > 0 && filterDateTo.length > 0) || (filterDateFrom.length === 0 && filterDateTo.length === 0)) {
        if(filterDateFrom.length === 0 && filterDateTo.length === 0) {
          updateDatesToCurrent();
          filterDateTo = getFormattedDateTo('DD/MM/YYYY');
          filterDateFrom = getFormattedDateFrom('DD/MM/YYYY');
        }

        applyFilter(filterDateFrom, filterDateTo, satellite);
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
      BDQueimadas.obj.getSocket().emit('continentFilterRequest', { continent: $(this).attr('id') });
      $('#continents-title').empty().html($(this).text());
      $('#countries-title').empty().html('Países');
      $('#states-title').empty().html('Estados');
    });

    $(document).on('click', '.country-item', function() {
      BDQueimadas.obj.getSocket().emit('countryFilterRequest', { country: $(this).attr('id') });
      $('#countries-title').empty().html($(this).text());
      $('#states-title').empty().html('Estados');
    });

    $(document).on('click', '.state-item', function() {
      BDQueimadas.obj.getSocket().emit('stateFilterRequest', { state: $(this).attr('id') });
      $('#states-title').empty().html($(this).text());
    });

    $('.filter-date').on('focus', function(el) {
      if($(this).parent().hasClass('has-error')) {
        $(this).parent().removeClass('has-error');
      }
    });
  };

  /**
   * Loads the sockets listeners.
   *
   * @private
   * @function loadSocketsListeners
   */
  var loadSocketsListeners = function() {
    BDQueimadas.obj.getSocket().on('continentFilterResponse', function(result) {
      var html = "",
          countriesCount = result.countries.rowCount;

      for(var i = 0; i < countriesCount; i++) {
        html += "<li class='country-item' id='" + result.countries.rows[i].id + "'><a href='#'>" + result.countries.rows[i].name + "</a></li>";
      }

      var extent = result.continentExtent.rows[0].extent.replace('BOX(', '').replace(')', '').split(',');

      var extentArray = extent[0].split(' ');
      extentArray = extentArray.concat(extent[1].split(' '));

      console.log(extentArray);

      TerraMA2WebComponents.webcomponents.MapDisplay.zoomToExtent(extentArray);
      $('#countries').empty().html(html);
    });

    BDQueimadas.obj.getSocket().on('countryFilterResponse', function(result) {
      var html = "",
          statesCount = result.states.rowCount;

      for(var i = 0; i < statesCount; i++) {
        html += "<li class='state-item' id='" + result.states.rows[i].id + "'><a href='#'>" + result.states.rows[i].name + "</a></li>";
      }

      var extent = result.countryExtent.rows[0].extent.replace('BOX(', '').replace(')', '').split(',');

      var extentArray = extent[0].split(' ');
      extentArray = extentArray.concat(extent[1].split(' '));

      TerraMA2WebComponents.webcomponents.MapDisplay.zoomToExtent(extentArray);
      $('#states').empty().html(html);
    });

    BDQueimadas.obj.getSocket().on('stateFilterResponse', function(result) {
      var extent = result.stateExtent.rows[0].extent.replace('BOX(', '').replace(')', '').split(',');

      var extentArray = extent[0].split(' ');
      extentArray = extentArray.concat(extent[1].split(' '));

      TerraMA2WebComponents.webcomponents.MapDisplay.zoomToExtent(extentArray);
    });
  };

  /**
   * Initializes the necessary features.
   *
   * @function init
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
    init: init
  };
})();
