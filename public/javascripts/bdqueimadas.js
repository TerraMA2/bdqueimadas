/** Main class of the BDQueimadas. */
var BDQueimadas = function(terrama2) {

  var _this = this;

  var filterConfig = null;
  var serverConfig = null;
  var featureDescription = null;
  var features = null;
  var socket = null;

  _this.getFeatureDescription = function() {
    return featureDescription;
  }

  _this.getFeatures = function() {
    return features;
  }

  _this.getFilterConfig = function() {
    return filterConfig;
  }

  _this.randomText = function() {
    var characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
    var random = '';

    for(var i = 0; i < 25; i++) {
      var rnum = Math.floor(Math.random() * characters.length);
      random += characters.substring(rnum, rnum + 1);
    }

    return random;
  }

  var loadConfigurations = function() {
    $.ajax({ url: "../config/filter.json", dataType: 'json', async: false, success: function(data) { filterConfig = data; } });
    $.ajax({ url: "../config/server.json", dataType: 'json', async: false, success: function(data) { serverConfig = data; } });
  }

  var loadFeaturesDescription = function() {
    var requestId = bdqueimadas.randomText();

    socket.emit(
      'proxyRequest',
      {
        url: serverConfig.URL + serverConfig.DescribeFeatureTypeParams + filterConfig.LayerToFilter,
        requestId: requestId
      }
    );
    socket.on('proxyResponse', function(msg) {
      if(msg.requestId === requestId) {
        featureDescription = msg.msg;
      }
    });
  }

  var loadFeatures = function() {
    var requestId = bdqueimadas.randomText();

    socket.emit(
      'proxyRequest',
      {
        url: serverConfig.URL + serverConfig.GetFeatureParams + filterConfig.LayerToFilter,
        requestId: requestId
      }
    );
    socket.on('proxyResponse', function(msg) {
      if(msg.requestId === requestId) {
        features = msg.msg;
      }
    });
  }

  $(document).ready(function() {
    loadConfigurations();

    $.ajax({ url: "/socket.io/socket.io.js", dataType: "script", async: true,
      success: function() {
        socket = io(window.location.origin);
        loadFeatures();
        loadFeaturesDescription();
      }
    });
  });
};
