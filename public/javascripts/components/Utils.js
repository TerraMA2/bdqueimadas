"use strict";

/**
 * Utilities class of the BDQueimadas.
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
        var currentDate = new Date();

        if(patternFormat[0] !== "0" && patternFormat[0] !== "INITIAL_DATE" && patternFormat[0] !== "FINAL_DATE") {
          var patterns = patternFormat[0].split(',');

          $.each(patterns, function(i, patternItem) {
            var patternArray = patternItem.split('|');

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
          });
        } else if(patternFormat[0] === "INITIAL_DATE") {
          var dates = getFilterDates(false, 0);

          if(dates !== null && dates.length !== 0) currentDate = stringToDate(dates[0], 'YYYY/MM/DD');
        } else if(patternFormat[0] === "FINAL_DATE") {
          var dates = getFilterDates(false, 0);

          if(dates !== null && dates.length !== 0) currentDate = stringToDate(dates[1], 'YYYY/MM/DD');
        }

        finalString = dateToString(currentDate, format);
        finalString = string.replace(datePattern[0], finalString);
      }
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
        var span = "<span class=\"layer-time-update\" data-id=\"" + layerId + "\"><a href=\"#\">" + datePattern[0] + "</a></span>";
        var input = "<input type=\"text\" style=\"width: 0; height: 0; opacity: 0;\" class=\"hidden-layer-time-update\" data-id=\"" + layerId + "\" id=\"hidden-layer-time-update-" + layerId + "\"/>";

        finalString = string.replace(datePattern[0], span) + input;
      }
    }

    return finalString;
  };

  /**
   * Returns the filter begin and end dates. If both fields are empty, is returned an empty array, if only one of the fields is empty, is returned a null value, otherwise is returned an array with the dates.
   * @param {boolean} showAlerts - Flag that indicates if the alerts should be shown
   * @param {integer} filter - Number that indicates which filter fields should be used: 0 - main filter, 1 - attributes table filter, 2 - graphics filter
   * @returns {array} returnValue - Empy array, or an array with the dates, or a null value
   *
   * @function getFilterDates
   * @memberof Utils
   * @inner
   */
  var getFilterDates = function(showAlerts, filter) {
    showAlerts = (typeof showAlerts === 'undefined') ? false : showAlerts;

    var filterFieldsExtention = '';

    if(filter === 1) {
      filterFieldsExtention = '-attributes-table';
    } else if(filter === 2) {
      filterFieldsExtention = '-graphics';
    }

    var filterDateFrom = $('#filter-date-from' + filterFieldsExtention);
    var filterDateTo = $('#filter-date-to' + filterFieldsExtention);

    var returnValue = null;

    if((filterDateFrom.val().length > 0 && filterDateTo.val().length > 0) || (filterDateFrom.val().length === 0 && filterDateTo.val().length === 0)) {
      if(filterDateFrom.val().length === 0 && filterDateTo.val().length === 0) {
        returnValue = [];
      } else {
        if(filterDateFrom.datepicker('getDate') > filterDateTo.datepicker('getDate')) {
          if(showAlerts) {
            vex.dialog.alert({
              message: '<p class="text-center">Data final anterior à inicial - corrigir!</p>',
              buttons: [{
                type: 'submit',
                text: 'Ok',
                className: 'bdqueimadas-btn'
              }]
            });
          }

          filterDateTo.val('');
        } else {
          returnValue = [filterDateFrom.val(), filterDateTo.val()];
        }
      }
    } else {
      if(filterDateFrom.val().length === 0) {
        vex.dialog.alert({
          message: '<p class="text-center">Data inicial inválida!</p>',
          buttons: [{
            type: 'submit',
            text: 'Ok',
            className: 'bdqueimadas-btn'
          }]
        });
      }

      if(filterDateTo.val().length === 0) {
        vex.dialog.alert({
          message: '<p class="text-center">Data final inválida!</p>',
          buttons: [{
            type: 'submit',
            text: 'Ok',
            className: 'bdqueimadas-btn'
          }]
        });
      }
    }

    return returnValue;
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
    for(var i = 0; i < array.length; i++) {
      if(array[i].toString() === string.toString())
        return true;
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

    for(var i = 0; i < a.length; ++i) {
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
    stringToDate: stringToDate,
    formatTime: formatTime,
    processStringWithDatePattern: processStringWithDatePattern,
    applyLayerTimeUpdateButton: applyLayerTimeUpdateButton,
    getFilterDates: getFilterDates,
    stringInArray: stringInArray,
    replaceAll: replaceAll,
    sortIntegerArray: sortIntegerArray,
    sortArray: sortArray,
    areArraysEqual: areArraysEqual,
    getStateIds: getStateIds,
    getBaseUrl: getBaseUrl,
    init: init
  };
});
