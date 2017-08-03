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
    init: init
  };
});
