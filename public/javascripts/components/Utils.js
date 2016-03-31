"use strict";

/**
 * Utilities class of the BDQueimadas.
 * @module Utils
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
   * Initializes the necessary features.
   *
   * @function init
   */
  var init = function() {};

  return {
    dateToString: dateToString,
    stringToDate: stringToDate,
    processStringWithDatePattern: processStringWithDatePattern,
    init: init
  };
})();
