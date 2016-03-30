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
   * @param {date} date - Date to be formatted
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
        var patterns = patternFormat[0].split(',');
        var format = patternFormat[1];
        var currentDate = new Date();

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

        finalString = dateToString(currentDate, format);
        finalString = string.replace(datePattern[0], finalString);
      }
    }

    return finalString;
  };

  return {
    dateToString: dateToString,
    processStringWithDatePattern: processStringWithDatePattern
  };
})();
