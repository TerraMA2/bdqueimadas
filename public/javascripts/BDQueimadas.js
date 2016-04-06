"use strict";

window.BDQueimadas = {
  components: {}
};

/**
 * Main class of the BDQueimadas.
 * @class BDQueimadas
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {json} memberFilterConfig - Filter configuration.
 * @property {json} memberAttributesTableConfig - Fires layer attributes table configuration.
 * @property {json} memberComponentsConfig - Components configuration.
 * @property {json} memberMapConfig - Map configuration.
 * @property {json} memberGraphicsConfig - Graphics configuration.
 * @property {object} memberSocket - Socket object.
 * @property {number} memberHeight - Window height.
 * @property {number} memberHeaderHeight - Header height.
 * @property {number} memberNavbarHeight - Navbar height.
 * @property {number} memberContentHeaderHeight - Content header height.
 * @property {number} memberReducedFooterHeight - Reduced footer height.
 * @property {number} memberMapSubtitleHeight - Map subtitle height.
 * @property {boolean} memberComponentsLoaded - Flag that indicates if all the components have been loaded.
 */
BDQueimadas.obj = (function() {

  // Filter configuration
  var memberFilterConfig = null;
  // Fires layer attributes table configuration
  var memberAttributesTableConfig = null;
  // Components configuration
  var memberComponentsConfig = null;
  // Map configuration
  var memberMapConfig = null;
  // Graphics configuration
  var memberGraphicsConfig = null;
  // Socket object
  var memberSocket = null;
  // Window height
  var memberHeight = null;
  // Header height
  var memberHeaderHeight = null;
  // Navbar height
  var memberNavbarHeight = null;
  // Content header height
  var memberContentHeaderHeight = null;
  // Reduced footer height
  var memberReducedFooterHeight = 12;
  // Map subtitle height
  var memberMapSubtitleHeight = null;
  // Flag that indicates if all the components have been loaded
  var memberComponentsLoaded = false;

  /**
   * Returns the socket object.
   * @returns {object} memberSocket - Socket object
   *
   * @function getSocket
   * @memberof BDQueimadas
   * @inner
   */
  var getSocket = function() {
    return memberSocket;
  };

  /**
   * Returns the filter configuration.
   * @returns {json} memberFilterConfig - Filter configuration
   *
   * @function getFilterConfig
   * @memberof BDQueimadas
   * @inner
   */
  var getFilterConfig = function() {
    return memberFilterConfig;
  };

  /**
   * Returns the fires layer attributes table configuration.
   * @returns {json} memberAttributesTableConfig - Attributes table configuration
   *
   * @function getAttributesTableConfig
   * @memberof BDQueimadas
   * @inner
   */
  var getAttributesTableConfig = function() {
    return memberAttributesTableConfig;
  };

  /**
   * Returns the map configuration.
   * @returns {json} memberMapConfig - Map configuration
   *
   * @function getMapConfig
   * @memberof BDQueimadas
   * @inner
   */
  var getMapConfig = function() {
    return memberMapConfig;
  };

  /**
   * Returns the graphics configuration.
   * @returns {json} memberGraphicsConfig - Graphics configuration
   *
   * @function getGraphicsConfig
   * @memberof BDQueimadas
   * @inner
   */
  var getGraphicsConfig = function() {
    return memberGraphicsConfig;
  };

  /**
   * Loads the components configurations.
   * @param {json} filterConfig - Filter configuration
   * @param {json} attributesTableConfig - Attributes table configuration
   * @param {json} componentsConfig - Components configuration
   * @param {json} mapConfig - Map configuration
   * @param {json} graphicsConfig - Graphics configuration
   *
   * @private
   * @function loadConfigurations
   * @memberof BDQueimadas
   * @inner
   */
  var loadConfigurations = function(filterConfig, attributesTableConfig, componentsConfig, mapConfig, graphicsConfig) {
    memberFilterConfig = filterConfig;
    memberAttributesTableConfig = attributesTableConfig;
    memberComponentsConfig = componentsConfig;
    memberMapConfig = mapConfig;
    memberGraphicsConfig = graphicsConfig;
  };

  /**
   * Loads the components present in the components configuration file.
   * @param {int} i - Current array index
   *
   * @private
   * @function loadComponents
   * @memberof BDQueimadas
   * @inner
   */
  var loadComponents = function(i) {
    if(i < memberComponentsConfig.Components.length) {
      $.ajax({
        url: "/javascripts/components/" + memberComponentsConfig[memberComponentsConfig.Components[i]],
        dataType: "script",
        success: function() {
          BDQueimadas.components[memberComponentsConfig.Components[i]].init();
          loadComponents(++i);
        }
      });
    } else {
      memberComponentsLoaded = true;
    }
  };

  /**
   * Loads the DOM events.
   *
   * @private
   * @function loadEvents
   * @memberof BDQueimadas
   * @inner
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
        setReducedContentSize(300);
      } else {
        $("#terrama2-map").addClass('fullmenu');
        setFullContentSize(300);
      }

      // Updates the map size
      TerraMA2WebComponents.webcomponents.MapDisplay.updateMapSize();
    });

    // Window resize event
    $(window).resize(function() {
      // Closes any open left content box and the left content box background
      closeAllLeftContentBoxes();
      closeLeftContentBoxBackground();

      // Executes map / DOM elements size updates during 300 milliseconds, with intervals of 10 milliseconds
      var interval = window.setInterval(function() {
        // Updates the variables that keep DOM elements sizes
        updateSizeVars();

        // Elements sizes adjustments, accordingly with the sidebar width
        if($("body").hasClass('sidebar-collapse'))
          setReducedContentSize(0);
        else
          setFullContentSize(0);

        // Updates the padding top of the sidebar
        $('.main-sidebar').attr("style", "padding-top: " + $('.main-header').outerHeight() + "px");

        TerraMA2WebComponents.webcomponents.MapDisplay.updateMapSize();
      }, 10);
      window.setTimeout(function() { clearInterval(interval); }, 300);
    });

    // Control sidebar toggle click event
    $('#control-sidebar-btn').on('click', function() {

      // Adjusts the position of the zoom control, attribution button and subtitle when the control sidebar opens or closes
      if($('.control-sidebar').hasClass('control-sidebar-open')) {
        $('.ol-zoom').animate({ 'right': '60px' }, { duration: 300, queue: false });
        $('.ol-attribution').animate({ 'right': '60px' }, { duration: 300, queue: false });
        $('#map-subtitle').animate({ 'right': '45px' }, { duration: 300, queue: false });
      } else {
        $('.ol-zoom').animate({ 'right': '15px' }, { duration: 300, queue: false });
        $('.ol-attribution').animate({ 'right': '15px' }, { duration: 300, queue: false });
        $('#map-subtitle').animate({ 'right': '0' }, { duration: 300, queue: false });
      }
    });

    // Exportation type click event
    $(document).on('change', '#exportation-type', function() {
      if($(this).val() !== "") {
        var exportLink = "/export?dateFrom=" + BDQueimadas.components.Filter.getFormattedDateFrom('YYYYMMDD') +
                         "&dateTo=" + BDQueimadas.components.Filter.getFormattedDateTo('YYYYMMDD') +
                         "&extent=" + TerraMA2WebComponents.webcomponents.MapDisplay.getCurrentExtent().toString() +
                         "&format=" + $(this).val();

        location.href = exportLink;

        vex.close();
      }
    });

    // Export click event
    $('#export').on('click', function() {
      $.ajax({
        url: "/exists-data-to-export",
        type: "GET",
        data: {
          dateFrom: BDQueimadas.components.Filter.getFormattedDateFrom('YYYYMMDD'),
          dateTo: BDQueimadas.components.Filter.getFormattedDateTo('YYYYMMDD'),
          extent: TerraMA2WebComponents.webcomponents.MapDisplay.getCurrentExtent().toString()
        },
        success: function(existsDataToExport) {
          if(existsDataToExport.existsDataToExport) {
            vex.dialog.alert({
              message: '<select id="exportation-type" class="form-control">' +
              '<option value="">Selecione o formato</option>' +
              '<option value="geojson">GeoJSON</option>' +
              '<option value="shapefile">Shapefile</option>' +
              '</select>',
              buttons: [{
                type: 'submit',
                text: 'Cancelar',
                className: 'bdqueimadas-btn'
              }]
            });
          } else {
            vex.dialog.alert({
              message: 'Não existem dados para exportar!',
              buttons: [{
                type: 'submit',
                text: 'Ok',
                className: 'bdqueimadas-btn'
              }]
            });
          }
        }
      });
    });
  };

  /**
   * Loads external plugins.
   *
   * @private
   * @function loadPlugins
   * @memberof BDQueimadas
   * @inner
   */
  var loadPlugins = function() {
    $(".date").inputmask("dd/mm/yyyy", {"placeholder": "dd/mm/aaaa"});
    $(".date").datepicker({
      dateFormat: 'dd/mm/yyyy',
      dayNames: ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'],
      dayNamesMin: ['D','S','T','Q','Q','S','S','D'],
      dayNamesShort: ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb','Dom'],
      monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
      monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
      nextText: 'Próximo',
      prevText: 'Anterior'
    });
  };

  /**
   * Opens the left content box background.
   * @param {string} leftContentBoxButton - Id of the left content box button corresponding to the active box
   * @param {string} leftContentBox - Id of the active left content box
   *
   * @private
   * @function openLeftContentBoxBackground
   * @memberof BDQueimadas
   * @inner
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
   * @memberof BDQueimadas
   * @inner
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
   * @memberof BDQueimadas
   * @inner
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
   * @memberof BDQueimadas
   * @inner
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
   * @memberof BDQueimadas
   * @inner
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
   * @memberof BDQueimadas
   * @inner
   */
  var updateSizeVars = function() {
    memberHeight = $(window).outerHeight();
    memberHeaderHeight = $('.main-header').outerHeight();
    memberNavbarHeight = $('.navbar').outerHeight();
    memberContentHeaderHeight = $(".content-wrapper > .content-header").outerHeight();
    memberMapSubtitleHeight = $('#map-subtitle').outerHeight();
  };

  /**
   * Updates content to full size.
   * @param {int} duration - Duration of the animation
   *
   * @private
   * @function setFullContentSize
   * @memberof BDQueimadas
   * @inner
   */
  var setFullContentSize = function(duration) {
    $('.content-wrapper').animate({ "min-height": (memberHeight - (memberHeaderHeight + memberReducedFooterHeight)) + "px" }, { duration: duration, queue: false });
    $('#terrama2-map').animate({ "height": (memberHeight - ((memberHeaderHeight + memberContentHeaderHeight) + memberReducedFooterHeight)) + "px" }, { duration: duration, queue: false });

    $('.left-content-box').animate({ "height": (memberHeight - ((memberHeaderHeight + memberContentHeaderHeight) + memberReducedFooterHeight)) + "px", "margin-top": (memberHeaderHeight + memberContentHeaderHeight) + "px" }, { duration: duration, queue: false });
    $('.control-sidebar').animate({ "padding-top": (memberHeaderHeight + memberContentHeaderHeight) + "px" }, { duration: duration, queue: false });
  };

  /**
   * Updates content to reduced size.
   * @param {int} duration - Duration of the animation
   *
   * @private
   * @function setReducedContentSize
   * @memberof BDQueimadas
   * @inner
   */
  var setReducedContentSize = function(duration) {
    $('.content-wrapper').animate({ "min-height": (memberHeight - (memberNavbarHeight + memberReducedFooterHeight)) + "px" }, { duration: duration, queue: false });
    $('#terrama2-map').animate({ "height": (memberHeight - ((memberNavbarHeight + memberContentHeaderHeight) + memberReducedFooterHeight)) + "px" }, { duration: duration, queue: false });

    $('.left-content-box').animate({ "height": (memberHeight - ((memberNavbarHeight + memberContentHeaderHeight) + memberReducedFooterHeight)) + "px", "margin-top": (memberNavbarHeight + memberContentHeaderHeight) + "px" }, { duration: duration, queue: false });
    $('.control-sidebar').animate({ "padding-top": (memberNavbarHeight + memberContentHeaderHeight) + "px" }, { duration: duration, queue: false });
  };

  /**
   * Returns the flag that indicates if all the components have been loaded.
   * @returns {boolean} memberComponentsLoaded - Flag that indicates if all the components have been loaded
   *
   * @function isComponentsLoaded
   * @memberof BDQueimadas
   * @inner
   */
  var isComponentsLoaded = function() {
    return memberComponentsLoaded;
  };

  /**
   * Initializes the necessary features.
   * @param {json} filterConfig - Filter configuration
   * @param {json} attributesTableConfig - Attributes table configuration
   * @param {json} componentsConfig - Components configuration
   * @param {json} mapConfig - Map configuration
   * @param {json} graphicsConfig - Graphics configuration
   *
   * @function init
   * @memberof BDQueimadas
   * @inner
   */
  var init = function(filterConfig, attributesTableConfig, componentsConfig, mapConfig, graphicsConfig) {
    $(document).ready(function() {
      var interval = window.setInterval(function() {
        updateSizeVars();
        setFullContentSize(300);
      }, 10);
      window.setTimeout(function() { clearInterval(interval); }, 300);

      loadEvents();
      loadConfigurations(filterConfig, attributesTableConfig, componentsConfig, mapConfig, graphicsConfig);
      loadPlugins();

      $.ajax({ url: "/socket.io/socket.io.js", dataType: "script", async: true,
        success: function() {
          memberSocket = io(window.location.origin);
          loadComponents(0);
        }
      });

      window.setInterval(function() { updateSizeVars(); }, 1000);
    });
  };

  return {
    getSocket: getSocket,
  	getFilterConfig: getFilterConfig,
    getAttributesTableConfig: getAttributesTableConfig,
    getMapConfig: getMapConfig,
    getGraphicsConfig: getGraphicsConfig,
    isComponentsLoaded: isComponentsLoaded,
  	init: init
  };
})();
