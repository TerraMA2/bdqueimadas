/** Filter class of the BDQueimadas. */
BDQueimadas.components.Filter = (function() {

  /**
   * Create the date filter
   * @param {string} dateFrom - initial filter date
   * @param {strin} dateTo - final filter date
   * @returns {string} cql - date cql filter
   */
  var createDateFilter = function(dateFrom, dateTo) {
    var cql = BDQueimadas.obj.getFilterConfig().DateFieldName + ">=" + processDate(dateFrom, BDQueimadas.obj.getFilterConfig().DateFormat);
    cql += " and ";
    cql += BDQueimadas.obj.getFilterConfig().DateFieldName + "<=" + processDate(dateTo, BDQueimadas.obj.getFilterConfig().DateFormat);

    return cql;
  };

  /**
   * Create the satellite filter
   * @param {string} satellite - filter satellite
   * @returns {string} cql - satellite cql filter
   */
  var createSatelliteFilter = function(satellite) {
    var cql = BDQueimadas.obj.getFilterConfig().SatelliteFieldName + "='" + satellite + "'";
    return cql;
  };

  /**
   * Apply the date and satellite filter
   * @param {string} dateFrom - initial filter date
   * @param {strin} dateTo - final filter date
   * @param {string} satellite - filter satellite
   */
  var applyFilter = function(dateFrom, dateTo, satellite) {
    var cql = "";

    if(dateFrom.length > 0 && dateTo.length > 0) {
      cql += createDateFilter(dateFrom, dateTo);
    }

    if(dateFrom.length > 0 && dateTo.length > 0 && satellite !== "all") {
      cql += " AND ";
    }

    if(satellite !== "all") {
      cql += createSatelliteFilter(satellite);
    }

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
  function unique(list) {
    var result = [];

    $.each(list, function(i, e) {
      if($.inArray(e, result) == -1) result.push(e);
    });

    return result;
  };

  var init = function() {
    $(document).ready(function() {
      $('#filter-button').on('click', function(el) {
        var dateFrom = $('#filter-date-from').val();
        var dateTo = $('#filter-date-to').val();
        var satellite = $('#filter-satellite').val();

        if((dateFrom.length > 0 && dateTo.length > 0) || (dateFrom.length === 0 && dateTo.length === 0)) {
          applyFilter(dateFrom, dateTo, satellite);
        } else {
          if(dateFrom.length === 0) {
            $("#filter-date-from").parent(":not([class*='has-error'])").addClass('has-error');
          }
          if(dateTo.length === 0) {
            $("#filter-date-to").parent(":not([class*='has-error'])").addClass('has-error');
          }
        }
      });

      $('.filter-date').on('focus', function(el) {
        if($(this).parent().hasClass('has-error')) {
          $(this).parent().removeClass('has-error');
        }
      });
    });
  };

  return {
    init: init
  };
})();
