/*
  Copyright (C) 2014 National Institute For Space Research (INPE) - Brazil.
  This file is part of JavaScript Client API for Web Time Series Service.
  Web Time Series Service for JavaScript is free software: you can
  redistribute it and/or modify it under the terms of the
  GNU Lesser General Public License as published by
  the Free Software Foundation, either version 3 of the License,
  or (at your option) any later version.
  Web Time Series Service for JavaScript is distributed in the hope that
  it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  GNU Lesser General Public License for more details.
  You should have received a copy of the GNU Lesser General Public License
  along with Web Time Series Service for JavaScript. See LICENSE. If not, write to
  e-sensing team at <esensning-team@dpi.inpe.br>.
*/

'use strict';

/*
  Return a XMLHttpRequest object accordingly to the web browser.
 */
function wtss_get_ajax()
{
// activeX versions to check for in IE
  var activexmodes = ["Msxml2.XMLHTTP", "Microsoft.XMLHTTP"];

  if(window.ActiveXObject) { // Test for support for ActiveXObject in IE first (as XMLHttpRequest in IE7 is broken)
    for (var i = 0; i < activexmodes.length; i++) {
      try {
        return new ActiveXObject(activexmodes[i]);
      }
      catch(e){
      // just suppress error
      }
    }
  }
  else if (window.XMLHttpRequest) // if Mozilla, Safari etc
    return new XMLHttpRequest();
  else
    return false;
}

/*
  Retrieve a JSON document from the given URI and then
  invoke the callback function "f"
 */
function wtss_get_json(uri, f) {
  var http_request = wtss_get_ajax();

  http_request.onreadystatechange = function() {

    if(http_request.readyState == http_request.DONE) {

      if(http_request.status == 200 && http_request.responseText != null) {

        var response = JSON.parse(http_request.responseText);

        if(f)
          f(response);
      }
    }
  };

  http_request.open("GET", uri, true);
  http_request.send(null);
}

/*
  Web Time Series Service API
 */
function wtss(host) {

  this.version = "0.1.0";

  this.host = host;
}

wtss.prototype.list_coverages = function(f) {
  if(!this.host)
    return;

  var query_str = this.host + "/wtss/list_coverages";

  wtss_get_json(query_str, f);
};

wtss.prototype.describe_coverage = function(coverage_name, f) {
  if(!this.host || !coverage_name || !f)
    return;

  var query_str = this.host + "/wtss/describe_coverage?name=" + coverage_name;

  wtss_get_json(query_str, f);
};

wtss.prototype.time_series = function(options, f) {
  if(!this.host || !options || !f)
    return;

  var query_str = this.host + "/wtss/time_series?coverage=" + options.coverage +
                  "&attributes=" + options.attributes.toString() +
                  "&longitude=" + options.longitude +
                  "&latitude=" + options.latitude;

  if(options.start && options.end) {
    query_str += "&start=" + options.start.toString();
    query_str += "&end=" + options.end.toString();
  }

  wtss_get_json(query_str, f);
};
