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
          var dates = getFilterDates();

          if(dates !== null && dates.length !== 0) currentDate = stringToDate(dates[0], 'YYYY/MM/DD');
        } else if(patternFormat[0] === "FINAL_DATE") {
          var dates = getFilterDates();

          if(dates !== null && dates.length !== 0) currentDate = stringToDate(dates[1], 'YYYY/MM/DD');
        }

        finalString = dateToString(currentDate, format);
        finalString = string.replace(datePattern[0], finalString);
      }
    }

    return finalString;
  };

  /**
   * Returns the filter begin and end dates. If both fields are empty, is returned an empty array, if only one of the fields is empty, is returned a null value, otherwise is returned an array with the dates.
   * @returns {array} returnValue - Empy array, or an array with the dates, or a null value
   *
   * @function getFilterDates
   * @memberof Utils
   * @inner
   */
  var getFilterDates = function() {
    var filterDateFrom = $('#filter-date-from').val();
    var filterDateTo = $('#filter-date-to').val();

    var returnValue = null;

    if((filterDateFrom.length > 0 && filterDateTo.length > 0) || (filterDateFrom.length === 0 && filterDateTo.length === 0)) {
      if(filterDateFrom.length === 0 && filterDateTo.length === 0) {
        returnValue = [];
      } else {
        returnValue = [filterDateFrom, filterDateTo];
      }
    } else {
      if(filterDateFrom.length === 0) {
        $("#filter-date-from").parent(":not([class*='has-error'])").addClass('has-error');
      }
      if(filterDateTo.length === 0) {
        $("#filter-date-to").parent(":not([class*='has-error'])").addClass('has-error');
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
    processStringWithDatePattern: processStringWithDatePattern,
    getFilterDates: getFilterDates,
    stringInArray: stringInArray,
    sortIntegerArray: sortIntegerArray,
    getBaseUrl: getBaseUrl,
    init: init
  };
});
