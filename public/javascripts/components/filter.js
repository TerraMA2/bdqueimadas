/** Filter class of the BDQueimadas. */
BDQueimadas.components.Filter = (function() {

  var dateFrom = null;
  var dateTo = null;
  var satellite = "all";

  var getFormattedDateFrom = function(format) {
    var finalDate = format;

    var dd = ('0' + dateFrom.getDate()).slice(-2);
    var mm = ('0' + (dateFrom.getMonth() + 1)).slice(-2);
    var yyyy = dateFrom.getFullYear().toString();

    if(format.match(/YYYY/)) {
      finalDate = finalDate.replace("YYYY", yyyy);
    } if(format.match(/MM/)) {
      finalDate = finalDate.replace("MM", mm);
    } if(format.match(/DD/)) {
      finalDate = finalDate.replace("DD", dd);
    }

    return finalDate;
  };

  var getFormattedDateTo = function(format) {
    var finalDate = format;

    var dd = ('0' + dateTo.getDate()).slice(-2);
    var mm = ('0' + (dateTo.getMonth() + 1)).slice(-2);
    var yyyy = dateTo.getFullYear().toString();

    if(format.match(/YYYY/)) {
      finalDate = finalDate.replace("YYYY", yyyy);
    } if(format.match(/MM/)) {
      finalDate = finalDate.replace("MM", mm);
    } if(format.match(/DD/)) {
      finalDate = finalDate.replace("DD", dd);
    }

    return finalDate;
  };

  var getSatellite = function() {
    return satellite;
  };

  /**
   * Create the date filter
   * @param {string} _dateFrom - initial filter date
   * @param {strin} _dateTo - final filter date
   * @returns {string} cql - date cql filter
   */
  var createDateFilter = function(_dateFrom, _dateTo) {
    updateDates(_dateFrom, _dateTo);

    var cql = BDQueimadas.obj.getFilterConfig().DateFieldName + ">=" + processDate(_dateFrom, BDQueimadas.obj.getFilterConfig().DateFormat);
    cql += " and ";
    cql += BDQueimadas.obj.getFilterConfig().DateFieldName + "<=" + processDate(_dateTo, BDQueimadas.obj.getFilterConfig().DateFormat);

    return cql;
  };

  var updateDates = function(_dateFrom, _dateTo) {
    var dateFromSplited = _dateFrom.split("/");
    var dateToSplited = _dateTo.split("/");

    dateFrom = new Date(dateFromSplited[2] + '-' + dateFromSplited[1] + '-' + dateFromSplited[0] + ' UTC-03:00');
    dateTo = new Date(dateToSplited[2] + '-' + dateToSplited[1] + '-' + dateToSplited[0] + ' UTC-03:00');

    dateFrom.setHours(0,0,0,0);
    dateTo.setHours(0,0,0,0);
  };

  var updateDatesToCurrent = function() {
    dateFrom = new Date();
    dateTo = new Date();
    dateFrom.setHours(dateFrom.getHours() - 24);

    dateFrom.setHours(0,0,0,0);
    dateTo.setHours(0,0,0,0);
  };

  /**
   * Create the satellite filter
   * @param {string} _satellite - filter satellite
   * @returns {string} cql - satellite cql filter
   */
  var createSatelliteFilter = function(_satellite) {
    var cql = BDQueimadas.obj.getFilterConfig().SatelliteFieldName + "='" + _satellite + "'";
    return cql;
  };

  /**
   * Apply the date and satellite filter
   * @param {string} _dateFrom - initial filter date
   * @param {strin} _dateTo - final filter date
   * @param {string} _satellite - filter satellite
   */
  var applyFilter = function(_dateFrom, _dateTo, _satellite) {
    var cql = "";

    if(_dateFrom.length > 0 && _dateTo.length > 0) {
      cql += createDateFilter(_dateFrom, _dateTo);
    }

    if(_dateFrom.length > 0 && _dateTo.length > 0 && _satellite !== "all") {
      cql += " AND ";
    }

    if(_satellite !== "all") {
      cql += createSatelliteFilter(_satellite);
    }

    updateSatelliteSelect();

    BDQueimadas.components.AttributesTable.updateTable();

    TerraMA2WebComponents.webcomponents.MapDisplay.applyCQLFilter(cql, BDQueimadas.obj.getFilterConfig().LayerToFilter);
  };

  /**
   * Apply the correct date format
   * @param {string} date - date to be formatted
   * @param {string} format - date to be used
   * @param {string} finalDate - date in the correct format
   */
  var processDate = function(date, format) {
    var finalDate = format;

    var dd = date.split("/")[0];
    var mm = date.split("/")[1];
    var yyyy = date.split("/")[2];

    if(format.match(/YYYY/)) {
      finalDate = finalDate.replace("YYYY", yyyy);
    } if(format.match(/MM/)) {
      finalDate = finalDate.replace("MM", mm);
    } if(format.match(/DD/)) {
      finalDate = finalDate.replace("DD", dd);
    }

    return finalDate;
  };

  /**
   * Remove the repetitions from a given array
   * @param {array} list - array to be filtered
   * @returns {array} result - array without repetitions
   */
  var unique = function(list) {
    var result = [];

    $.each(list, function(i, e) {
      if($.inArray(e, result) == -1) result.push(e);
    });

    return result;
  };

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

  var loadEvents = function() {
    $('#filter-button').on('click', function(el) {
      var _dateFrom = $('#filter-date-from').val();
      var _dateTo = $('#filter-date-to').val();
      satellite = $('#filter-satellite').val();

      if((_dateFrom.length > 0 && _dateTo.length > 0) || (_dateFrom.length === 0 && _dateTo.length === 0)) {
        if(_dateFrom.length === 0 && _dateTo.length === 0) {
          updateDatesToCurrent();
          _dateTo = getFormattedDateTo('DD/MM/YYYY');
          _dateFrom = getFormattedDateFrom('DD/MM/YYYY');
        }

        applyFilter(_dateFrom, _dateTo, satellite);
      } else {
        if(_dateFrom.length === 0) {
          $("#filter-date-from").parent(":not([class*='has-error'])").addClass('has-error');
        }
        if(_dateTo.length === 0) {
          $("#filter-date-to").parent(":not([class*='has-error'])").addClass('has-error');
        }
      }
    });

    $('.filter-date').on('focus', function(el) {
      if($(this).parent().hasClass('has-error')) {
        $(this).parent().removeClass('has-error');
      }
    });
  };

  var init = function() {
    $(document).ready(function() {
      updateDatesToCurrent();
      loadEvents();
    });
  };

  return {
    getFormattedDateFrom: getFormattedDateFrom,
    getFormattedDateTo: getFormattedDateTo,
    getSatellite: getSatellite,
    init: init
  };
})();
