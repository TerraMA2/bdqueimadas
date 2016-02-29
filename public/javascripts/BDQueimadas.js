"use strict";

window.BDQueimadas = {
  components: {}
};

/**
 * Main class of the BDQueimadas.
 * @module BDQueimadas
 *
 * @property {json} filterConfig - Filter configuration.
 * @property {json} serverConfig - Mapping server configuration.
 * @property {json} attributesTableConfig - Fires layer attributes table configuration.
 * @property {string} featureDescription - Fires layer feature description.
 * @property {string} features - Fires layer features.
 * @property {object} socket - Socket object.
 * @property {number} height - Window height.
 * @property {number} headerHeight - Header height.
 * @property {number} navbarHeight - Navbar height.
 * @property {number} contentHeaderHeight - Content header height.
 * @property {number} reducedFooterHeight - Reduced footer height.
 */
BDQueimadas.obj = (function() {

  // Filter configuration
  var filterConfig = null;
  // Mapping server configuration
  var serverConfig = null;
  // Fires layer attributes table configuration
  var attributesTableConfig = null;
  // Fires layer feature description
  var featureDescription = null;
  // Fires layer features
  var features = null;
  // Socket object
  var socket = null;
  // Window height
  var height = null;
  // Header height
  var headerHeight = null;
  // Navbar height
  var navbarHeight = null;
  // Content header height
  var contentHeaderHeight = null;
  // Reduced footer height
  var reducedFooterHeight = 12;

  /**
   * Returns the fires layer feature description.
   * @returns {string} featureDescription - Feature description
   *
   * @function getFeatureDescription
   */
  var getFeatureDescription = function() {
    return featureDescription;
  };

  /**
   * Returns the fires layer features.
   * @returns {string} features - Features
   *
   * @function getFeatures
   */
  var getFeatures = function() {
    return features;
  };

  /**
   * Returns the socket object.
   * @returns {object} socket - Socket object
   *
   * @function getSocket
   */
  var getSocket = function() {
    return socket;
  };

  /**
   * Returns the filter configuration.
   * @returns {json} filterConfig - Filter configuration
   *
   * @function getFilterConfig
   */
  var getFilterConfig = function() {
    return filterConfig;
  };

  /**
   * Returns the fires layer attributes table configuration.
   * @returns {json} attributesTableConfig - Attributes table configuration
   *
   * @function getAttributesTableConfig
   */
  var getAttributesTableConfig = function() {
    return attributesTableConfig;
  };

  /**
   * Generates a random text.
   * @returns {string} random - Random text
   *
   * @function randomText
   */
  var randomText = function() {
    var characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
    var random = '';

    for(var i = 0; i < 25; i++) {
      var rnum = Math.floor(Math.random() * characters.length);
      random += characters.substring(rnum, rnum + 1);
    }

    return random;
  };

  /**
   * Loads the components configurations.
   * @param {json} _filterConfig - Filter configuration
   * @param {json} _serverConfig - Mapping server configuration
   * @param {json} _attributesTableConfig - Attributes table configuration
   *
   * @private
   * @function loadConfigurations
   */
  var loadConfigurations = function(_filterConfig, _serverConfig, _attributesTableConfig) {
    filterConfig = _filterConfig;
    serverConfig = _serverConfig;
    attributesTableConfig = _attributesTableConfig;
  };

  /**
   * Loads the components.
   *
   * @private
   * @function loadComponents
   */
  var loadComponents = function() {
    $.ajax({ url: "/javascripts/components/Filter.js", dataType: "script", success: function() {
      BDQueimadas.components.Filter.init();
      $.ajax({ url: "/javascripts/components/AttributesTable.js", dataType: "script", success: function() {
        BDQueimadas.components.AttributesTable.init();
        $.ajax({ url: "/javascripts/components/graphics.js", dataType: "script", success: function() {
          BDQueimadas.components.Graphics.init();
          $.ajax({ url: "/javascripts/components/Map.js", dataType: "script", success: function() {
            BDQueimadas.components.Map.init();
          }});
        }});
      }});
    }});
  };

  /**
   * Loads the fires layer feature description.
   *
   * @private
   * @function loadFeatureDescription
   */
  var loadFeatureDescription = function() {
    var requestId = randomText();

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
  };

  /**
   * Loads the fires layer features.
   *
   * @private
   * @function loadFeatures
   */
  var loadFeatures = function() {
    var requestId = randomText();

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
  };

  /**
   * Loads the DOM events.
   *
   * @private
   * @function loadEvents
   */
  var loadEvents = function() {
    // Sidebar buttons click event
    $(".sidebar-menu > li").on('click', function(event) {
      event.preventDefault();

      var box = $(this).attr('box');
      var id = $(this).attr('id');

      // Checks if the left content box to be open is set in the button
      if(box !== "" && box !== undefined) {
        var active = $("#" + box).hasClass('active');

        // Closes any open left content box and the left content box background
        closeAllLeftContentBoxes();
        closeLeftContentBoxBackground();

        // Opens the left content box corresponding to the button and the left content box background, if the box is not already open
        if(!active) {
          openLeftContentBoxBackground(id, box);
          openLeftContentBox(box, $(this).text().trim());
        }
      } else {
        var active = $("#left-content-box-background").hasClass('active');
        var buttonBoxActive = $("#left-content-box-background").attr('leftContentBoxButton');

        // Closes any open left content box and the left content box background
        closeAllLeftContentBoxes();
        closeLeftContentBoxBackground();

        // Opens the left content box background in case it wasn't already open, or if it was open but not by the same button that was caught in this event
        if(buttonBoxActive !== id || !active) {
          openLeftContentBoxBackground(id, '');
        }
      }
    });

    // Sidebar toggle click event
    $('.sidebar-toggle').on('click', function() {
      // Updates the variables that keep DOM elements sizes
      updateSizeVars();

      // Block valid only for the toggle in the initial screen
      if($(this).hasClass("begin")) {
        $('#welcome').animate({ 'opacity': '0' }, { duration: 300, queue: false });
        window.setTimeout(function() { $('#welcome').css('display', 'none'); }, 300);
        $('#main-sidebar-toggle').css("display", "");
      }

      // If a left content box is open, the size of it is adjusted
      if($(".left-content-box").hasClass('active')) {
        var activeLeftContentBox = $("#" + $("#left-content-box-background").attr('leftContentBoxButton')).attr('box');
        adjustLeftContentBoxSize(activeLeftContentBox);
      }

      // If the left content box background is open, the size of it is adjusted
      if($("#left-content-box-background").hasClass('active')) {
        adjustLeftContentBoxSize("left-content-box-background");
      }

      // Elements sizes adjustments, accordingly with the sidebar width
      if($("body").hasClass('sidebar-collapse')) {
        $("#terrama2-map").removeClass('fullmenu');
        $('.left-content-box').animate({ 'margin-top': '120px' }, { duration: 300, queue: false });

        setReducedContentSize();
      } else {
        $("#terrama2-map").addClass('fullmenu');
        $('.left-content-box').animate({ 'margin-top': '300px' }, { duration: 300, queue: false });

        setFullContentSize();
      }

      // Updates the map size
      TerraMA2WebComponents.webcomponents.MapDisplay.updateMapSize();
    });

    // Window resize event
    $(window).resize(function() {
      // Closes any open left content box and the left content box background
      closeAllLeftContentBoxes();
      closeLeftContentBoxBackground();

      // Updates the variables that keep DOM elements sizes
      updateSizeVars();

      // Elements sizes adjustments, accordingly with the sidebar width
      if($("body").hasClass('sidebar-collapse')) {
        setReducedContentSize();
      } else {
        setFullContentSize();
      }

      // Updates the padding top of the sidebar
      $('.main-sidebar').attr("style", "padding-top: " + $('.main-header').outerHeight() + "px");

      // Executes map size updates during 300 milliseconds, with intervals of 10 milliseconds
      var interval = window.setInterval(function() { TerraMA2WebComponents.webcomponents.MapDisplay.updateMapSize(); }, 10);
      window.setTimeout(function() { clearInterval(interval); }, 300);
    });
  };

  /**
   * Loads external plugins.
   *
   * @private
   * @function loadPlugins
   */
  var loadPlugins = function() {
    $(".date").inputmask("dd/mm/yyyy", {"placeholder": "dd/mm/aaaa"});

    window.setTimeout(function() { $('.left-content-box').mCustomScrollbar({ axis:"yx" }); }, 3000);
  };

  /**
   * Opens the left content box background.
   * @param {string} leftContentBoxButton - Id of the left content box button corresponding to the active box
   * @param {string} leftContentBox - Id of the active left content box
   *
   * @private
   * @function openLeftContentBoxBackground
   */
  var openLeftContentBoxBackground = function(leftContentBoxButton, leftContentBox) {
    var width = '';
    var left = '';

    if(leftContentBox !== '' && $("#" + leftContentBox).hasClass('fullscreen')) {
      width = '100%';
    } else {
      width = '370px';
    }

    if($("body").hasClass('sidebar-collapse')) {
      left = '30px';
    } else {
      left = '210px';
    }

    $("#left-content-box-background").addClass('active');
    $("#left-content-box-background").attr('leftContentBoxButton', leftContentBoxButton);
    $("#left-content-box-background").animate({ width: width, left: left }, { duration: 300, queue: false });
  };

  /**
   * Closes the left content box background.
   *
   * @private
   * @function closeLeftContentBoxBackground
   */
  var closeLeftContentBoxBackground = function() {
    $("#left-content-box-background").removeClass('active');
    $("#left-content-box-background").animate({ width: '350px', left: '-350px' }, { duration: 300, queue: false });
    $("#left-content-box-background").attr('leftContentBoxButton', '');
  };

  /**
   * Opens the left content box corresponding to the received id.
   * @param {string} leftContentBox - Id of the left content box to be opened
   * @param {string} headerText - Content header text
   *
   * @private
   * @function openLeftContentBox
   */
  var openLeftContentBox = function(leftContentBox, headerText) {
    $("#" + leftContentBox).addClass('active');

    if($("body").hasClass('sidebar-collapse')) {
      $("#" + leftContentBox).animate({ left: '50px' }, { duration: 300, queue: false });
    } else {
      if($("#" + leftContentBox).hasClass('fullscreen')) $("#" + leftContentBox).addClass('fullmenu');
      $("#" + leftContentBox).animate({ left: '230px' }, { duration: 300, queue: false });
    }

    $(".content-header > h1").html(headerText);
  };

  /**
   * Adjusts the left content box size corresponding to the received id, accordingly with the left menu width.
   * @param {string} id - Left content box id
   *
   * @private
   * @function adjustLeftContentBoxSize
   */
  var adjustLeftContentBoxSize = function(id) {
    if($("#" + id).css('left') === '230px') {
      $("#" + id).animate({ left: '50px' }, { duration: 250, queue: false });
      if($("#" + id).hasClass('fullscreen')) $("#" + id).removeClass('fullmenu');
    } else if($("#" + id).css('left') === '210px') {
      $("#" + id).animate({ left: '30px' }, { duration: 250, queue: false });
      if($("#" + id).hasClass('fullscreen')) $("#" + id).removeClass('fullmenu');
    } else if($("#" + id).css('left') === '50px') {
      $("#" + id).animate({ left: '230px' }, { duration: 400, queue: false });
      if($("#" + id).hasClass('fullscreen')) $("#" + id).addClass('fullmenu');
    } else {
      $("#" + id).animate({ left: '210px' }, { duration: 400, queue: false });
      if($("#" + id).hasClass('fullscreen')) $("#" + id).addClass('fullmenu');
    }
  };

  /**
   * Closes all the left content boxes.
   *
   * @private
   * @function closeAllLeftContentBoxes
   */
  var closeAllLeftContentBoxes = function() {
    $(".content-header > h1").html("Banco de Dados de Queimadas");
    $(".left-content-box").removeClass('active');
    $(".left-content-box").removeClass('fullmenu');
    $(".left-content-box").animate({ left: '-100%' }, { duration: 300, queue: false });
  };

  /**
   * Updates the variables that keep DOM elements sizes.
   *
   * @private
   * @function updateSizeVars
   */
  var updateSizeVars = function() {
    height = $(window).outerHeight();
    headerHeight = $(".main-header").outerHeight();
    navbarHeight = $('.navbar').outerHeight();
    contentHeaderHeight = $(".content-wrapper > .content-header").outerHeight();
  };

  /**
   * Updates content to full size.
   *
   * @private
   * @function setFullContentSize
   */
  var setFullContentSize = function() {
    $('.content-wrapper').attr("style", "min-height: " + (height - (headerHeight + reducedFooterHeight)) + "px");
    $('#terrama2-map').attr("style", "height: " + (height - ((headerHeight + contentHeaderHeight) + reducedFooterHeight)) + "px");
    $('.left-content-box').attr("style", "height: " + (height - ((headerHeight + contentHeaderHeight) + reducedFooterHeight + 20)) + "px; margin-top: " + (headerHeight + contentHeaderHeight) + "px;");
  };

  /**
   * Updates content to reduced size.
   *
   * @private
   * @function setReducedContentSize
   */
  var setReducedContentSize = function() {
    $('.content-wrapper').attr("style", "min-height: " + (height - (navbarHeight + reducedFooterHeight)) + "px");
    $('#terrama2-map').attr("style", "height: " + (height - ((navbarHeight + contentHeaderHeight) + reducedFooterHeight)) + "px");
    $('.left-content-box').attr("style", "height: " + (height - ((navbarHeight + contentHeaderHeight) + reducedFooterHeight + 20)) + "px; margin-top: " + (navbarHeight + contentHeaderHeight) + "px;");
  };

  /**
   * Initializes the necessary features.
   * @param {json} _filterConfig - Filter configuration
   * @param {json} _serverConfig - Mapping server configuration
   * @param {json} _attributesTableConfig - Attributes table configuration
   *
   * @function init
   */
  var init = function(_filterConfig, _serverConfig, _attributesTableConfig) {
    $(document).ready(function() {
      updateSizeVars();
      setFullContentSize();
      loadEvents();
      loadConfigurations(_filterConfig, _serverConfig, _attributesTableConfig);
      loadPlugins();

      $.ajax({ url: "/socket.io/socket.io.js", dataType: "script", async: true,
        success: function() {
          socket = io(window.location.origin);
          loadFeatures();
          loadFeatureDescription();
          loadComponents();
        }
      });

      window.setInterval(function() { updateSizeVars(); }, 1000);
    });
  };

  return {
  	getFeatureDescription: getFeatureDescription,
    getFeatures: getFeatures,
    getSocket: getSocket,
  	getFilterConfig: getFilterConfig,
    getAttributesTableConfig: getAttributesTableConfig,
  	randomText: randomText,
  	init: init
  };
})();
