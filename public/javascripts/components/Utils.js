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
    $.each(array, function(i, item) {
      if(item === string)
        return true;
    });
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
   * Corrects the longitude of the map, if it's wrong. That's necessary because Openlayers 3 (in the current version) has a bug, when the map is moved to the right or to the left the X coordinate keeps growing.
   * @param {float} longitude - Original longitude
   * @returns {float} correctedLongitude - Corrected longitude
   *
   * @function correctLongitude
   * @memberof Utils
   * @inner
   */
  var correctLongitude = function(longitude) {
    // Variable that will keep the corrected longitude
    var correctedLongitude = parseFloat(longitude);
    // Variable that will keep the original longitude
    var originalLongitude = parseFloat(longitude);

    // The correction is executed only if the longitude is incorrect
    if(originalLongitude > 180 || originalLongitude <= -180) {
      // If the longitude is negative, it's converted to a positive float, otherwise just to a float
      longitude = originalLongitude < 0 ? longitude * -1 : parseFloat(longitude);

      // Division of the longitude by 180:
      //   If the result is an even negative integer, nothing is added, subtracted or rounded
      //   If the result is an odd negative integer, is added 1 to the result
      //   If the result is a positive integer, is subtracted 1 from the result
      //   If isn't integer but its integer part is even, it's rounded down
      //   Otherwise, it's rounded up
      var divisionResult = 0;
      if((originalLongitude / 180) % 2 === -0)
        divisionResult = longitude / 180;
      else if((originalLongitude / 180) % 2 === -1)
        divisionResult = (longitude / 180) + 1;
      else if((longitude / 180) % 1 === 0)
        divisionResult = (longitude / 180) - 1;
      else if(parseInt(longitude / 180) % 2 === 0)
        divisionResult = parseInt(longitude / 180);
      else
        divisionResult = Math.ceil(longitude / 180);

      // If the division result is greater than zero, the correct longitude is calculated:
      //   If the original longitude is negative, the division result multiplied by 180 is added to it
      //   Otherwise, the division result multiplied by 180 is subtracted from it
      if(divisionResult > 0)
        correctedLongitude = (originalLongitude < 0) ? originalLongitude + (divisionResult * 180) : originalLongitude - (divisionResult * 180);
    }

    return correctedLongitude;
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
    correctLongitude: correctLongitude,
    init: init
  };
})();
