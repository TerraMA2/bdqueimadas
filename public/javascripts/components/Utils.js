"use strict";

/**
 * Utilities class of the BDQueimadas (client side).
 * @class Utils
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {json} memberConfigurations - Configurations object.
 * @property {object} memberSocket - Socket object.
 * @property {string} memberBaseUrl - Base Url.
 */
define(function() {

  // Configurations object
  var memberConfigurations = null;
  // Socket object
  var memberSocket = null;
  // Base Url
  var memberBaseUrl = null;

  /**
   * Returns the configurations object.
   * @returns {json} memberConfigurations - Configurations object
   *
   * @function getConfigurations
   * @memberof Utils
   * @inner
   */
  var getConfigurations = function() {
    return memberConfigurations;
  };

  /**
   * Returns the socket object.
   * @returns {object} memberSocket - Socket object
   *
   * @function getSocket
   * @memberof Utils
   * @inner
   */
  var getSocket = function() {
    return memberSocket;
  };

  /**
   * Converts a date into a string date formatted accordingly with the received format.
   * @param {Date} date - Date
   * @param {string} format - Format
   * @returns {string} stringDate - Formatted string date
   *
   * @function dateToString
   * @memberof Utils
   * @inner
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
   * Converts a datetime into a string datetime formatted accordingly with the received format.
   * @param {Date} dateTime - Datetime
   * @param {string} format - Format
   * @returns {string} stringDateTime - Formatted string datetime
   *
   * @function dateTimeToString
   * @memberof Utils
   * @inner
   */
  var dateTimeToString = function(dateTime, format) {
    var stringDateTime = format;

    var dd = ('0' + dateTime.getDate()).slice(-2);
    var mm = ('0' + (dateTime.getMonth() + 1)).slice(-2);
    var yyyy = dateTime.getFullYear().toString();

    var hh = ('0' + dateTime.getHours()).slice(-2);
    var min = ('0' + dateTime.getMinutes()).slice(-2);
    var sec = ('0' + dateTime.getSeconds()).slice(-2);

    if(format.match(/YYYY/)) stringDateTime = stringDateTime.replace("YYYY", yyyy);
    if(format.match(/MM/)) stringDateTime = stringDateTime.replace("MM", mm);
    if(format.match(/DD/)) stringDateTime = stringDateTime.replace("DD", dd);

    if(format.match(/HH/)) stringDateTime = stringDateTime.replace("HH", hh);
    if(format.match(/II/)) stringDateTime = stringDateTime.replace("II", min);
    if(format.match(/SS/)) stringDateTime = stringDateTime.replace("SS", sec);

    return stringDateTime;
  };

  /**
   * Converts a string date formatted accordingly with the received format into a date.
   * @param {string} date - String date
   * @param {string} format - Format
   * @returns {date} finalDate - Date
   *
   * @function stringToDate
   * @memberof Utils
   * @inner
   */
  var stringToDate = function(date, format) {
    var yearPosition = format.indexOf("YYYY");
    var monthPosition = format.indexOf("MM");
    var datePosition = format.indexOf("DD");

    var year = date.substring(yearPosition, yearPosition + 4);
    var month = date.substring(monthPosition, monthPosition + 2);
    var date = date.substring(datePosition, datePosition + 2);

    var finalDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(date), 0, 0, 0);

    return finalDate;
  };

  /**
   * Converts a string datetime formatted accordingly with the received format into a datetime.
   * @param {string} dateTime - String datetime
   * @param {string} format - Format
   * @returns {date} finalDate - Datetime
   *
   * @function stringToDateTime
   * @memberof Utils
   * @inner
   */
  var stringToDateTime = function(dateTime, format) {
    var yearPosition = format.indexOf("YYYY");
    var monthPosition = format.indexOf("MM");
    var datePosition = format.indexOf("DD");

    var hourPosition = format.indexOf("HH");
    var minutePosition = format.indexOf("II");
    var secondPosition = format.indexOf("SS");

    var year = dateTime.substring(yearPosition, yearPosition + 4);
    var month = dateTime.substring(monthPosition, monthPosition + 2);
    var date = dateTime.substring(datePosition, datePosition + 2);

    var hour = dateTime.substring(hourPosition, hourPosition + 2);
    var minute = dateTime.substring(minutePosition, minutePosition + 2);
    var second = dateTime.substring(secondPosition, secondPosition + 2);

    var finalDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(date), parseInt(hour), parseInt(minute), parseInt(second));

    return finalDate;
  };

  /**
   * Formats a time with a given format.
   * @param {string} time - String time
   * @param {string} currentFormat - Current format
   * @param {string} newFormat - New format
   * @returns {string} newTime - Formatted time
   *
   * @function formatTime
   * @memberof Utils
   * @inner
   */
  var formatTime = function(time, currentFormat, newFormat) {
    var hoursPosition = currentFormat.indexOf("HH");
    var minutesPosition = currentFormat.indexOf("MM");
    var secondsPosition = currentFormat.indexOf("SS");
    var newTime = newFormat;

    var hours = time.substring(hoursPosition, hoursPosition + 2);
    var minutes = time.substring(minutesPosition, minutesPosition + 2);
    var seconds = time.substring(secondsPosition, secondsPosition + 2);

    if(newFormat.match(/HH/)) newTime = newTime.replace("HH", hours);
    if(newFormat.match(/MM/)) newTime = newTime.replace("MM", minutes);
    if(newFormat.match(/SS/)) newTime = newTime.replace("SS", seconds);

    return newTime;
  };

  /**
   * Processes a string that contains a date pattern. If the string has one or more patterns, the function subtracts or adds days / months / years to the current date, accordingly with the received patterns, otherwise the original string is returned.
   * @param {string} string - String to be processed
   * @returns {string} finalString - Processed string
   *
   * @function processStringWithDatePattern
   * @memberof Utils
   * @inner
   */
  var processStringWithDatePattern = function(string) {
    var finalString = string;

    if(string !== null && string !== undefined) {
      var datePattern = string.match("{{(.*)}}");

      if(datePattern !== null) {
        var patternFormat = datePattern[1].split('=');
        var format = patternFormat[1];
        var currentDate = getCurrentDate(true);

        if(patternFormat[0] === "YEAR_SLIDER") {
          var patternYears = patternFormat[2].split('-');

          finalString = patternYears[0] + " - " + patternYears[1];
          finalString = string.replace(datePattern[0], finalString);
        } else if(patternFormat[0] !== "0" && patternFormat[0] !== "INITIAL_DATE" && patternFormat[0] !== "FINAL_DATE") {
          var patterns = patternFormat[0].split(',');

          for(var i = 0, patternsLength = patterns.length; i < patternsLength; i++) {
            var patternArray = patterns[i].split('|');

            var signal = patternArray[0];
            var number = parseInt(patternArray[1]);
            var key = patternArray[2].toLowerCase();

            switch(key) {
              case 'd':
                if(signal === '+') currentDate.setDate(currentDate.getDate() + number);
                else currentDate.setDate(currentDate.getDate() - number);
                break;
              case 'm':
                if(signal === '+') currentDate.setMonth(currentDate.getMonth() + number);
                else currentDate.setMonth(currentDate.getMonth() - number);
                break;
              case 'y':
                if(signal === '+') currentDate.setFullYear(currentDate.getFullYear() + number);
                else currentDate.setFullYear(currentDate.getFullYear() - number);
                break;
              default:
                break;
            }
          }
        } else if(patternFormat[0] === "INITIAL_DATE") {
          var dates = getFilterDates(false, true, true, 0);

          if(dates !== null && dates.length !== 0) currentDate = stringToDate(dates[0], 'YYYY/MM/DD');
        } else if(patternFormat[0] === "FINAL_DATE") {
          var dates = getFilterDates(false, true, true, 0);

          if(dates !== null && dates.length !== 0) currentDate = stringToDate(dates[1], 'YYYY/MM/DD');
        }

        if(patternFormat[0] !== "YEAR_SLIDER") {
          finalString = dateToString(currentDate, format);
          finalString = string.replace(datePattern[0], finalString);
        }
      }
    }

    return finalString;
  };

  /**
   * Returns the format from a string that contains a date pattern.
   * @param {string} string - String to be processed
   * @returns {string} finalString - Processed string
   *
   * @function getFormatFromStringWithDatePattern
   * @memberof Utils
   * @inner
   */
  var getFormatFromStringWithDatePattern = function(string) {
    var finalString = string;

    if(string !== null && string !== undefined) {
      var datePattern = string.match("{{(.*)}}");

      if(datePattern !== null) {
        var patternFormat = datePattern[1].split('=');
        var finalString = patternFormat[1];
      }
    }

    return finalString;
  };

  /**
   * Replaces a date pattern with a given string.
   * @param {string} string - String to be processed
   * @param {string} newString - String to replace the pattern
   * @returns {string} finalString - Processed string
   *
   * @function replaceDatePatternWithString
   * @memberof Utils
   * @inner
   */
  var replaceDatePatternWithString = function(string, newString) {
    var finalString = string;

    if(string !== null && string !== undefined) {
      var datePattern = string.match("{{(.*)}}");

      if(datePattern !== null)
        finalString = string.replace(datePattern[0], newString);
    }

    return finalString;
  };

  /**
   * Creates a layer time update button in a string that have a date pattern.
   * @param {string} string - String where the button should be created
   * @param {string} layerId - Layer id
   * @returns {string} finalString - Processed string
   *
   * @function applyLayerTimeUpdateButton
   * @memberof Utils
   * @inner
   */
  var applyLayerTimeUpdateButton = function(string, layerId) {
    var finalString = string;

    if(string !== null && string !== undefined && layerId !== null && layerId !== undefined) {
      var datePattern = string.match("{{(.*)}}");

      if(datePattern !== null) {
        var patternFormat = datePattern[1].split('=');

        if(patternFormat[0] === "YEAR_SLIDER") {
          var patternValidYears = patternFormat[1].split('-');
          var patternCurrentYears = patternFormat[2].split('-');

          var input = "<div class=\"slider-div hidden\" id=\"slider-div-" + layerId.replace(':', '') + "\">" +
                        "<input style=\"width: 80%;\" type=\"text\" value=\"\" id=\"slider-" + layerId.replace(':', '') + "\" data-last-value=\"[" + patternCurrentYears[0] + "," + patternCurrentYears[1] + "]\" class=\"slider form-control\" data-slider-min=\"" + patternValidYears[0] + "\" data-slider-max=\"" + patternValidYears[1] + "\" data-slider-step=\"1\" data-slider-value=\"[" + patternCurrentYears[0] + "," + patternCurrentYears[1] + "]\" data-slider-tooltip-position=\"bottom\" data-slider-orientation=\"horizontal\" data-slider-selection=\"before\" data-slider-tooltip=\"show\" data-slider-id=\"yellow\">" +
                        "<i class=\"fa fa-check update-slider-time\" data-layer-id=\"" + layerId.replace(':', '') + "\"></i>" +
                        "<i class=\"fa fa-close close-slider-div\" data-layer-id=\"" + layerId.replace(':', '') + "\"></i>" +
                      "</div>";

          var years = "<span class=\"layer-time-update-years\" id=\"years-span-" + layerId.replace(':', '') + "\" data-id=\"" + layerId.replace(':', '') + "\"><a href=\"#\">" + patternCurrentYears[0] + " - " + patternCurrentYears[1] + "</a></span>";

          finalString = string.replace(datePattern[0], years) + input;
        } else {
          var span = "<span class=\"layer-time-update\" data-id=\"" + layerId.replace(':', '') + "\"><a href=\"#\">" + datePattern[0] + "</a></span>";
          var input = "<input type=\"text\" style=\"width: 0; height: 0; opacity: 0;\" class=\"hidden-layer-time-update\" data-id=\"" + layerId.replace(':', '') + "\" id=\"hidden-layer-time-update-" + layerId.replace(':', '') + "\"/>";

          finalString = string.replace(datePattern[0], span) + input;
        }
      }
    }

    return finalString;
  };

  /**
   * Returns the filter begin and end dates. If both fields are empty, is returned an empty array, if only one of the fields is empty, is returned a null value, otherwise is returned an array with the dates.
   * @param {boolean} showAlerts - Flag that indicates if the alerts should be shown
   * @param {boolean} emptyFields - Flag that indicates if the fields should be emptied
   * @param {boolean} validadeNumberOfDays - Flag that indicates if the number of days (max of 365) should be validated
   * @param {integer} filter - Number that indicates which filter fields should be used: 0 - main filter, 1 - attributes table filter, 2 - graphics filter
   * @returns {array} returnValue - Empy array, or an array with the dates, or a null value
   *
   * @function getFilterDates
   * @memberof Utils
   * @inner
   */
  var getFilterDates = function(showAlerts, emptyFields, validadeNumberOfDays, filter) {
    showAlerts = (typeof showAlerts === 'undefined') ? false : showAlerts;

    var filterFieldsExtention = '';

    if(filter === 1)
      filterFieldsExtention = '-attributes-table';
    else if(filter === 2)
      filterFieldsExtention = '-graphics';
    else if(filter === 3)
      filterFieldsExtention = '-export';

    var filterDateFrom = $('#filter-date-from' + filterFieldsExtention);
    var filterDateTo = $('#filter-date-to' + filterFieldsExtention);

    var returnValue = null;

    if(((filterDateFrom.val().length > 0 && filterDateTo.val().length > 0) || (filterDateFrom.val().length === 0 && filterDateTo.val().length === 0)) && filterDateFrom.val().replace(new RegExp('a', 'g'), '').replace(new RegExp('m', 'g'), '').replace(new RegExp('d', 'g'), '').length === 10 && filterDateTo.val().replace(new RegExp('a', 'g'), '').replace(new RegExp('m', 'g'), '').replace(new RegExp('d', 'g'), '').length === 10) {
      if(filterDateFrom.val().length === 0 && filterDateTo.val().length === 0)
        returnValue = [];
      else {
        var timeDiffBetweenDates = Math.abs(filterDateTo.datepicker('getDate').getTime() - filterDateFrom.datepicker('getDate').getTime());
        var diffDaysBetweenDates = Math.ceil(timeDiffBetweenDates / (1000 * 3600 * 24));

        if(filterDateFrom.datepicker('getDate') > filterDateTo.datepicker('getDate')) {
          if(showAlerts)
            $('#filter-error-dates' + filterFieldsExtention).text('Data final anterior à inicial - corrigir!');

          if(emptyFields)
            filterDateTo.val('');
        } else if(filterDateFrom.datepicker('getDate') > getCurrentDate(true)) {
          if(showAlerts)
            $('#filter-error-dates' + filterFieldsExtention).text('Data inicial posterior à atual - corrigir!');

          if(emptyFields)
            filterDateFrom.val('');
        } else if(filterDateTo.datepicker('getDate') > getCurrentDate(true)) {
          if(showAlerts)
            $('#filter-error-dates' + filterFieldsExtention).text('Data final posterior à atual - corrigir!');

          if(emptyFields)
            filterDateTo.val('');
        } else if(diffDaysBetweenDates > 366 && validadeNumberOfDays) {
          if(showAlerts)
            $('#filter-error-dates' + filterFieldsExtention).text('O período do filtro deve ser menor ou igual a 366 dias - corrigir!');

          if(emptyFields) {
            filterDateFrom.val('');
            filterDateTo.val('');
          }
        } else
          returnValue = [filterDateFrom.val(), filterDateTo.val()];
      }
    } else {
      if(filterDateFrom.val().length === 0 && showAlerts)
        $('#filter-error-dates' + filterFieldsExtention).text('Data inicial inválida!');

      if(filterDateTo.val().length === 0 && showAlerts)
        $('#filter-error-dates' + filterFieldsExtention).text('Data final inválida!');
    }

    return returnValue;
  };

  /**
   * Returns the filter begin and end times. If both fields are empty, is returned an empty array, if only one of the fields is empty, is returned a null value, otherwise is returned an array with the times.
   * @param {boolean} showAlerts - Flag that indicates if the alerts should be shown
   * @param {integer} filter - Number that indicates which filter fields should be used: 0 - main filter, 1 - attributes table filter, 2 - graphics filter
   * @returns {array} returnValue - Empy array, or an array with the times, or a null value
   *
   * @function getFilterTimes
   * @memberof Utils
   * @inner
   */
  var getFilterTimes = function(showAlerts, filter) {
    showAlerts = (typeof showAlerts === 'undefined') ? false : showAlerts;

    var filterFieldsExtention = '';

    if(filter === 1) {
      filterFieldsExtention = '-attributes-table';
    } else if(filter === 2) {
      filterFieldsExtention = '-graphics';
    }

    var filterTimeFrom = $('#filter-time-from' + filterFieldsExtention);
    var filterTimeTo = $('#filter-time-to' + filterFieldsExtention);

    var returnValue = null;

    if((filterTimeFrom.val().length > 0 && filterTimeTo.val().length > 0) || (filterTimeFrom.val().length === 0 && filterTimeTo.val().length === 0)) {
      if(filterTimeFrom.val().length === 0 && filterTimeTo.val().length === 0) {
        returnValue = [];
      } else {
        if(isTimeValid(filterTimeFrom.val()) && isTimeValid(filterTimeTo.val())) {
          returnValue = [filterTimeFrom.val() + ':00', filterTimeTo.val() + ':59'];
        } else if(!isTimeValid(filterTimeFrom.val()) && !isTimeValid(filterTimeTo.val())) {
          $('#filter-error-dates' + filterFieldsExtention).text('Horas inválidas!');
          filterTimeFrom.val('');
          filterTimeTo.val('');
        } else if(!isTimeValid(filterTimeFrom.val())) {
          $('#filter-error-dates' + filterFieldsExtention).text('Hora inicial inválida!');
          filterTimeFrom.val('');
        } else {
          $('#filter-error-dates' + filterFieldsExtention).text('Hora final inválida!');
          filterTimeTo.val('');
        }
      }
    } else {
      if(filterTimeFrom.val().length === 0) {
        $('#filter-error-dates' + filterFieldsExtention).text('Hora inicial inválida!');
      }

      if(filterTimeTo.val().length === 0) {
        $('#filter-error-dates' + filterFieldsExtention).text('Hora final inválida!');
      }
    }

    return returnValue;
  };

  /**
   * Verifies if a time with the format hh:mm is valid.
   * @param {string} value - Given time
   * @returns {boolean} isValid - Flag that indicates if the time is valid
   *
   * @function isTimeValid
   * @memberof Utils
   * @inner
   */
  var isTimeValid = function(value) {
    var isValid = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/.test(value);

    return isValid;
  };

  /**
   * Verifies if a string exists in an array.
   * @param {array} array - Array where the search will be performed
   * @param {string} string - String to be searched
   * @returns {boolean} boolean - Flag that indicates if the string exists in the array
   *
   * @function stringInArray
   * @memberof Utils
   * @inner
   */
  var stringInArray = function(array, string) {
    if(array !== null) {
      for(var i = 0, arrayLength = array.length; i < arrayLength; i++) {
        if(array[i].toString() === string.toString())
          return true;
      }
    }

    return false;
  };

  /**
   * Replaces all occurrences of a string inside another string.
   * @param {string} subject - Subject string
   * @param {string} find - String to be replaced
   * @param {string} replace - New string
   * @returns {string} string - New string after the replacement
   *
   * @function replaceAll
   * @memberof Utils
   * @inner
   */
  var replaceAll = function(subject, find, replace) {
    return subject.replace(new RegExp(find, 'g'), replace);
  };

  /**
   * Sorts an array of integers and returns it in JSON format, along with the original index of each value.
   * @param {array} array - Array of integers to be sorted
   * @param {string} [order=asc] - Sorting order
   * @returns {json} json - JSON containing the result
   *
   * @function sortIntegerArray
   * @memberof Utils
   * @inner
   */
  var sortIntegerArray = function(array, order) {
    var json = [];

    order = (order !== null && order !== undefined && (order === 'asc' || order === 'desc')) ? order : 'asc';

    for(var key in array) {
      json.push({ key: key, value: array[key] });
    }

    json.sort(function(a, b) {
      var intA = parseInt(a.value),
          intB = parseInt(b.value);

      if(intA > intB) return (order === 'asc') ? 1 : -1;
      if(intA < intB) return (order === 'asc') ? -1 : 1;

      return 0;
    });

    return json;
  };

  /**
   * Sorts a simple array of integers or strings.
   * @param {array} array - Array to be sorted
   * @param {string} [order=asc] - Sorting order
   * @returns {array} array - Sorted array
   *
   * @function sortArray
   * @memberof Utils
   * @inner
   */
  var sortArray = function(array, order) {
    order = (order !== null && order !== undefined && (order === 'asc' || order === 'desc')) ? order : 'asc';

    if(isNaN(array[0])) {
      array.sort();
      if(order === 'desc') array.reverse();
    } else {
      array.sort(function(a, b) {
        var intA = parseFloat(a),
            intB = parseFloat(b);

        if(intA > intB) return (order === 'asc') ? 1 : -1;
        if(intA < intB) return (order === 'asc') ? -1 : 1;

        return 0;
      });
    }

    return array;
  };

  /**
   * Compares two arrays.
   * @param {array} a - Array to be compared
   * @param {array} b - Array to be compared
   * @param {boolean} compareOrder - Flag that indicates if the order should be compared
   * @returns {boolean} boolean - Flag that indicates if the arrays are equal or not
   *
   * @function areArraysEqual
   * @memberof Utils
   * @inner
   */
  var areArraysEqual = function(a, b, compareOrder) {
    if(a === b) return true;
    if(a == null || b == null) return false;
    if(a.length != b.length) return false;

    if(!compareOrder) {
      a = sortArray(a, 'asc');
      b = sortArray(b, 'asc');
    }

    for(var i = 0, aLength = a.length; i < aLength; ++i) {
      var aValue = isNaN(a[i]) ? a[i] : parseFloat(a[i]);
      var bValue = isNaN(b[i]) ? b[i] : parseFloat(b[i]);

      if(aValue !== bValue) return false;
    }

    return true;
  };

  /**
   * Receives a string that contains the id of the country and the id of the state, and returns an array with both ids formatted as integers.
   * @param {string} ids - String containing the id of the country and the id of the state
   * @returns {array} idsArray - Array with both ids formatted as integers
   *
   * @function getStateIds
   * @memberof Utils
   * @inner
   */
  var getStateIds = function(ids) {
    var idsArray = [];

    idsArray.push(parseInt(ids.substr(0, 3)));
    idsArray.push(parseInt(ids.substr(3, 4)));

    return idsArray;
  };

  /**
   * Returns the base Url.
   * @returns {string} memberBaseUrl - Base Url
   *
   * @function getBaseUrl
   * @memberof Utils
   * @inner
   */
  var getBaseUrl = function() {
    return memberBaseUrl;
  };

  /**
   * Sums the items of an integer array.
   * @param {array} values - Integer array
   * @returns {integer} sum - Sum of the array items
   *
   * @function sumIntegerArrayItems
   * @memberof Utils
   * @inner
   */
  var sumIntegerArrayItems = function(values) {
    var sum = values.reduce(sumTwoStringIntegers, 0);

    return sum;
  };

  /**
   * Sums the two received items.
   * @param {string} a - Item a
   * @param {string} b - Item b
   * @returns {integer} sum - Sum of the two items
   *
   * @function sumTwoStringIntegers
   * @memberof Utils
   * @inner
   */
  var sumTwoStringIntegers = function(a, b) {
    var sum = parseInt(a) + parseInt(b);
    return sum;
  };

  /**
   * Returns the current date.
   * @param {boolean} utc - Flag that indicates if the date should be in UTC
   * @returns {Date} currentDate - Current date
   *
   * @function getCurrentDate
   * @memberof Utils
   * @inner
   */
  var getCurrentDate = function(utc) {
    var now = new Date();
    var nowUTC = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());

    var currentDate = utc ? nowUTC : now;

    return currentDate;
  };

  /**
   * Converts a latitude from decimal format to DMS.
   * @param {float} latitude - Latitude
   * @returns {string} dmsCoordinate - Latitude in DMS format
   *
   * @function convertLatitudeToDMS
   * @memberof Utils
   * @inner
   */
  var convertLatitudeToDMS = function(latitude) {
    var dmsCoordinate = "";

    var signal = latitude.toString().substring(0, 1);

    if(signal == "-") {
      latitude = latitude.toString().substring(1);
      dmsCoordinate += "S ";
    } else {
      dmsCoordinate += "N ";
    }

    var valuesOne = latitude.toString().split(".");
    dmsCoordinate += valuesOne[0] + " ";
    var valuesTwo = (parseFloat("0." + valuesOne[1]) * 60).toString().split(".");
    dmsCoordinate += valuesTwo[0] + " " + (parseFloat("0." + valuesTwo[1]) * 60).toFixed(2).toString();

    return dmsCoordinate;
  };

  /**
   * Converts a longitude from decimal format to DMS.
   * @param {float} longitude - Longitude
   * @returns {string} dmsCoordinate - Longitude in DMS format
   *
   * @function convertLongitudeToDMS
   * @memberof Utils
   * @inner
   */
  var convertLongitudeToDMS = function(longitude) {
    var dmsCoordinate = "";

    var signal = longitude.toString().substring(0, 1);

    if(signal == "-") {
      longitude = longitude.toString().substring(1);
      dmsCoordinate += "O ";
    } else {
      dmsCoordinate += "L ";
    }

    var valuesOne = longitude.toString().split(".");
    dmsCoordinate += valuesOne[0] + " ";
    var valuesTwo = (parseFloat("0." + valuesOne[1]) * 60).toString().split(".");
    dmsCoordinate += valuesTwo[0] + " " + (parseFloat("0." + valuesTwo[1]) * 60).toFixed(2).toString();

    return dmsCoordinate;
  };

  /**
   * Initializes the necessary features.
   * @param {object} configurations - Configurations object
   * @param {string} baseUrl - Base Url
   *
   * @function init
   * @memberof Utils
   * @inner
   */
  var init = function(configurations, baseUrl) {
    memberConfigurations = configurations;
    memberBaseUrl = baseUrl;
    memberSocket = io.connect(window.location.origin, { path: baseUrl + 'socket.io' });
  };

  return {
    getSocket: getSocket,
    getConfigurations: getConfigurations,
    dateToString: dateToString,
    dateTimeToString: dateTimeToString,
    stringToDate: stringToDate,
    stringToDateTime: stringToDateTime,
    formatTime: formatTime,
    processStringWithDatePattern: processStringWithDatePattern,
    getFormatFromStringWithDatePattern: getFormatFromStringWithDatePattern,
    replaceDatePatternWithString: replaceDatePatternWithString,
    applyLayerTimeUpdateButton: applyLayerTimeUpdateButton,
    getFilterDates: getFilterDates,
    getFilterTimes: getFilterTimes,
    isTimeValid: isTimeValid,
    stringInArray: stringInArray,
    replaceAll: replaceAll,
    sortIntegerArray: sortIntegerArray,
    sortArray: sortArray,
    areArraysEqual: areArraysEqual,
    getStateIds: getStateIds,
    getBaseUrl: getBaseUrl,
    sumIntegerArrayItems: sumIntegerArrayItems,
    sumTwoStringIntegers: sumTwoStringIntegers,
    getCurrentDate: getCurrentDate,
    convertLatitudeToDMS: convertLatitudeToDMS,
    convertLongitudeToDMS: convertLongitudeToDMS,
    init: init
  };
});
