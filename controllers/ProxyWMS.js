"use strict";

/**
 * Proxy responsible for processing WMS requests when needed.
 * @class ProxyWMS
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberHttp - 'http' module.
 * @property {array} memberRegularChars - Array of regular characters.
 * @property {array} memberHttpChars - Array of escaped http characters.
 */
var ProxyWMS = function(app) {

  // 'http' module
  var memberHttp = require('http');
  // Array of regular characters
  var memberRegularChars = [" ", "!", "\"", "#", "$", "%", "&", "'", "(", ")", "*", "+", ",", "-", ".", ":", ";", "<", "=", ">", "?", "@", "/"];
  // Array of escaped http characters
  var memberHttpChars = ["%20", "%21", "%22", "%23", "%24", "%25", "%26", "%27", "%28", "%29", "%2A", "%2B", "%2C", "%2D", "%2E", "%3A", "%3B", "%3C", "%3D", "%3E", "%3F", "%40", "%2F"];

  var proxyWMS = function(request, response) {

    var url = request['url'].replace('/wms-proxy', '');

    for(var i = 0, count = memberRegularChars.length; i < count; i++) {
      var regex = new RegExp(memberHttpChars[i], "g");
      url = url.replace(regex, memberRegularChars[i]);
    }

    var externalReq = memberHttp.request({
      host: "gibs.earthdata.nasa.gov",
      path: "/twms/epsg4326/best/twms.cgi" + url
    }, function(externalRes) {
      response.setHeader("content-type", externalRes.headers["content-type"]);
      externalRes.pipe(response);
    });

    externalReq.end();
  };

  return proxyWMS;
};

module.exports = ProxyWMS;
