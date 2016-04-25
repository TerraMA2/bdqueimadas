"use strict";

/**
 * Utilities class of the BDQueimadas.
 * @class Utils
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 */
BDQueimadas.components.Utils = (function() {

  /**
   * Converts a date into a string date formatted accordingly with the received format.
   * @param {date} date - Date
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

    var finalDate = new Date(year + '-' + month + '-' + date + ' UTC-03:00');

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

        if(patternFormat[0] !== '0') {
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
        }

        finalString = dateToString(currentDate, format);
        finalString = string.replace(datePattern[0], finalString);
      }
    }

    return finalString;
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
   * Initializes the necessary features.
   *
   * @function init
   * @memberof Utils
   * @inner
   */
  var init = function() {};

  return {
    dateToString: dateToString,
    stringToDate: stringToDate,
    processStringWithDatePattern: processStringWithDatePattern,
    stringInArray: stringInArray,
    sortIntegerArray: sortIntegerArray,
    init: init
  };
})();
