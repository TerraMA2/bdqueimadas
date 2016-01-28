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
    $(".sidebar-menu > li").on('click', function(event) {
      event.preventDefault();

      var box = $(this).attr('box');
      var id = $(this).attr('id');

      if(box !== "" && box !== undefined) {
        var active = $("#" + box).hasClass('active');

        closeAllContentBoxes();
        closeBg();

        if(!active) {
          openBg(id, box);
          openContentBox(box);
        }
      } else {
        var active = $("#left-content-box-background").hasClass('active');
        var boxActive = $("#left-content-box-background").attr('box');

        closeAllContentBoxes();
        closeBg();

        if(boxActive !== id || !active) {
          openBg(id, '');
        }
      }
    });

    $('.sidebar-toggle').on('click', function() {
      if($(".left-content-box").hasClass('active')) {
        var currentBox = $("#" + $("#left-content-box-background").attr('box')).attr('box');
        ajustBoxesSize(currentBox);
      }

      if($("#left-content-box-background").hasClass('active')) {
        ajustBoxesSize("left-content-box-background");
      }

      if($("body").hasClass('sidebar-collapse')) {
        $("#terrama2-map").removeClass('fullmenu');
      } else {
        $("#terrama2-map").addClass('fullmenu');
      }

      terrama2.getMapDisplay().updateMapSize();
    });
  }

  var closeBg = function() {
    $("#left-content-box-background").removeClass('active');
    $("#left-content-box-background").animate({ width: '350px', left: '-350px' }, { duration: 300, queue: false });
    $("#left-content-box-background").attr('box', '');
  }

  var closeAllContentBoxes = function() {
    $(".left-content-box").removeClass('active');
    $(".left-content-box").removeClass('fullmenu');
    $(".left-content-box").animate({ left: '-100%' }, { duration: 300, queue: false });
  }

  var ajustBoxesSize = function(id) {
    if($("#" + id).css('left') === '230px') {
      $("#" + id).animate({ left: '50px' }, { duration: 250, queue: false });
      if($("#" + id).hasClass('fullscreen')) $("#" + id).removeClass('fullmenu');
    } else {
      $("#" + id).animate({ left: '230px' }, { duration: 400, queue: false });
      if($("#" + id).hasClass('fullscreen')) $("#" + id).addClass('fullmenu');
    }
  }

  var openBg = function(box, contentBox) {
    var width = '';
    var left = '';

    if(contentBox !== '' && $("#" + contentBox).hasClass('fullscreen')) {
      width = '100%';
    } else {
      width = '350px';
    }

    if($("body").hasClass('sidebar-collapse')) {
      left = '50px';
    } else {
      left = '230px';
    }

    $("#left-content-box-background").addClass('active');
    $("#left-content-box-background").attr('box', box);
    $("#left-content-box-background").animate({ width: width, left: left }, { duration: 300, queue: false });
  }

  var openContentBox = function(box) {
    $("#" + box).addClass('active');

    if($("body").hasClass('sidebar-collapse')) {
      $("#" + box).animate({ left: '50px' }, { duration: 300, queue: false });
    } else {
      if($("#" + box).hasClass('fullscreen')) $("#" + box).addClass('fullmenu');
      $("#" + box).animate({ left: '230px' }, { duration: 300, queue: false });
    }
  }

  var loadPlugins = function() {
    $(".date").inputmask("dd/mm/yyyy", {"placeholder": "dd/mm/aaaa"});

    window.setTimeout(function() { $('.left-content-box').mCustomScrollbar({ axis:"yx" }); }, 3000);
  }

  $(document).ready(function() {
    loadEvents();
    loadConfigurations();
    loadPlugins();

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
