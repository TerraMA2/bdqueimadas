/** Main class of the BDQueimadas. */
var BDQueimadas = function(_terrama2) {

  var _this = this;

  var filterConfig = null;
  var serverConfig = null;
  var featureDescription = null;
  var features = null;
  var socket = null;
  var attributesTable = null;
  var filter = null;
  var graphics = null;
  var terrama2 = _terrama2;

  var regularMap = true;

  _this.getTerrama2 = function() {
    return terrama2;
  }

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

  var loadComponents = function() {
    $.ajax({ url: "/javascripts/components/filter.js", dataType: "script", success: function() {
      filter = new Filter(_this);
      $.ajax({ url: "/javascripts/components/attributestable.js", dataType: "script", success: function() {
        attributesTable = new AttributesTable(_this);
        $.ajax({ url: "/javascripts/components/graphics.js", dataType: "script", success: function() {
          graphics = new Graphics(_this);
        }});
      }});
    }});
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

  var loadEvents = function() {
    $("#maximize-map-button").on('click', function() {
      if(regularMap) {
        regularMap = false;
        $(".top").addClass("minor");
        $(".top-title").css("display", "none");
        $(".top-language").css("display", "none");
        $(".footer").addClass("minor");
        $(".footer-text").css("display", "none");
        $("#maximized-map-logos").removeClass("hide");
        $(".content").addClass("bigger");
        $(this).removeClass("maximize-map").addClass("minimize-map");
        terrama2.getMapDisplay().updateMapSize();
      } else {
        regularMap = true;
        $(".top").removeClass("minor");
        $(".top-title").css("display", "");
        $(".top-language").css("display", "");
        $(".footer").removeClass("minor");
        $(".footer-text").css("display", "");
        $("#maximized-map-logos").addClass("hide");
        $(".content").removeClass("bigger");
        $(this).removeClass("minimize-map").addClass("maximize-map");
        terrama2.getMapDisplay().updateMapSize();
      }
    });
  }

  var loadPlugins = function() {
    $('.date').mask("00/00/0000", {clearIfNotMatch: true});
  }

  $(document).ready(function() {
    loadPlugins();
    loadEvents();
    loadConfigurations();

    $.ajax({ url: "/socket.io/socket.io.js", dataType: "script", async: true,
      success: function() {
        socket = io(window.location.origin);
        loadFeatures();
        loadFeaturesDescription();
        loadComponents();
      }
    });
  });
};
