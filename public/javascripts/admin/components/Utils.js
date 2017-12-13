"use strict";

/**
 * Utilities class of the BDQueimadasAdmin (client side).
 * @class Utils
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberSocket - Socket object.
 * @property {string} memberBaseUrl - Base Url.
 */
define(function() {

  // Socket object
  var memberSocket = null;
  // Base Url
  var memberBaseUrl = null;

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
   * Initializes the necessary features.
   * @param {string} baseUrl - Base Url
   *
   * @function init
   * @memberof Utils
   * @inner
   */
  var init = function(baseUrl) {
    memberBaseUrl = baseUrl;
    memberSocket = io.connect(window.location.origin, { path: baseUrl + 'socket.io' });
  };

  return {
    getSocket: getSocket,
    getBaseUrl: getBaseUrl,
    stringInArray: stringInArray,
    init: init
  };
});
