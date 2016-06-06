"use strict";

/**
 * Main class of the BDQueimadas.
 * @class BDQueimadas
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {number} memberHeight - Window height.
 * @property {number} memberHeaderHeight - Header height.
 * @property {number} memberNavbarHeight - Navbar height.
 * @property {number} memberContentHeaderHeight - Content header height.
 * @property {number} memberReducedFooterHeight - Reduced footer height.
 * @property {number} memberMapSubtitleHeight - Map subtitle height.
 */
define(
  ['components/Utils', 'components/Filter', 'components/AttributesTable', 'components/Graphics', 'components/Map', 'TerraMA2WebComponents'],
  function(Utils, Filter, AttributesTable, Graphics, Map, TerraMA2WebComponents) {

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

    /**
     * Updates the necessary components.
     *
     * @function updateComponents
     * @memberof BDQueimadas
     * @inner
     */
    var updateComponents = function() {
      AttributesTable.updateAttributesTable();
      Graphics.updateGraphics();
    };

    /**
     * Applies the filters.
     *
     * @private
     * @function applyFilter
     * @memberof BDQueimadas
     * @inner
     */
    var applyFilter = function() {
      var dates = Utils.getFilterDates();

      if(dates !== null) {
        Filter.setSatellite($('#filter-satellite').val());

        if(dates.length === 0) {
          Filter.updateDatesToCurrent();
          var filterDateFrom = Filter.getFormattedDateFrom('YYYY/MM/DD');
          var filterDateTo = Filter.getFormattedDateTo('YYYY/MM/DD');
        } else {
          var filterDateFrom = dates[0];
          var filterDateTo = dates[1];
        }

        Filter.applyFilter(filterDateFrom, filterDateTo, Filter.getSatellite());
        updateComponents();
      } else {
        $('#filter-satellite').val(Filter.getSatellite());
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
      // General Events

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
          $('#welcome-image').animate({ 'opacity': '0' }, { duration: 300, queue: false });
          window.setTimeout(function() {
            $('#welcome').css('display', 'none');
            $('#welcome-image').css('display', 'none');
          }, 300);
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
        TerraMA2WebComponents.MapDisplay.updateMapSize();
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
          setReducedContentSize(0);
        } else {
          setFullContentSize(0);
        }

        // Updates the padding top of the sidebar
        $('.main-sidebar').attr("style", "padding-top: " + $('.main-header').outerHeight() + "px");

        TerraMA2WebComponents.MapDisplay.updateMapSize();
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
          var exportLink = Utils.getBaseUrl() + "export?dateFrom=" + Filter.getFormattedDateFrom(Utils.getConfigurations().firesDateFormat) +
                           "&dateTo=" + Filter.getFormattedDateTo(Utils.getConfigurations().firesDateFormat) +
                           "&satellite=" + (Filter.getSatellite() !== "all" ? Filter.getSatellite() : "") +
                           "&extent=" + TerraMA2WebComponents.MapDisplay.getCurrentExtent().toString() +
                           "&country=" + (Filter.getCountry() !== null ? Filter.getCountry() : "") +
                           "&state=" + (Filter.getState() !== null ? Filter.getState() : "") +
                           "&format=" + $(this).val();

          location.href = exportLink;

          vex.close();
        }
      });

      // Export click event
      $('#export').on('click', function() {
        $.ajax({
          url: Utils.getBaseUrl() + "exists-data-to-export",
          type: "GET",
          data: {
            dateFrom: Filter.getFormattedDateFrom(Utils.getConfigurations().firesDateFormat),
            dateTo: Filter.getFormattedDateTo(Utils.getConfigurations().firesDateFormat),
            satellite: (Filter.getSatellite() !== "all" ? Filter.getSatellite() : ""),
            extent: TerraMA2WebComponents.MapDisplay.getCurrentExtent().toString(),
            country: (Filter.getCountry() !== null ? Filter.getCountry() : ""),
            state: (Filter.getState() !== null ? Filter.getState() : "")
          },
          success: function(existsDataToExport) {
            if(existsDataToExport.existsDataToExport) {
              vex.dialog.alert({
                message: '<select id="exportation-type" class="form-control">' +
                '<option value="">Selecione o formato</option>' +
                '<option value="geojson">GeoJSON</option>' +
                '<option value="shapefile">Shapefile</option>' +
                '<option value="csv">CSV</option>' +
                '</select>',
                buttons: [{
                  type: 'submit',
                  text: 'Cancelar',
                  className: 'bdqueimadas-btn'
                }]
              });
            } else {
              vex.dialog.alert({
                message: '<p class="text-center">Não existem dados para exportar!</p>',
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

      // Filter Events

      $('#filter-button').on('click', function() {
        applyFilter();
      });

      $('.continent-item').on('click', function() {
        Utils.getSocket().emit('spatialFilterRequest', { id: $(this).attr('id'), text: $(this).text(), key: 'Continent' });
      });

      $(document).on('click', '.country-item', function() {
        Utils.getSocket().emit('spatialFilterRequest', { id: $(this).attr('id'), text: $(this).text(), key: 'Country' });
      });

      $(document).on('click', '.state-item', function() {
        Utils.getSocket().emit('spatialFilterRequest', { id: $(this).attr('id'), text: $(this).text(), key: 'State' });
      });

      $('.filter-date').on('focus', function() {
        if($(this).parent().hasClass('has-error')) {
          $(this).parent().removeClass('has-error');
        }
      });

      $('#updateComponents').on('click', function() {
        updateComponents();
      });

      // Graphics Events

      $('#show-time-series-graphic').on('click', function() {
        Graphics.setTimeSeriesTool();
      });

      // Map Events

      $('#dragbox').on('click', function() {
        Map.resetMapMouseTools();
        Map.activateDragboxTool();
      });

      $('#moveMap').on('click', function() {
        Map.resetMapMouseTools();
        Map.activateMoveMapTool();
      });

      $('#initialExtent').on('click', function() {
        Map.resetMapMouseTools();
        Map.initialExtent();
        Map.activateMoveMapTool();
        Filter.resetDropdowns();
      });

      $('.map-subtitle-toggle').on('click', function() {
        Map.updateZoomTop(true);
      });

      TerraMA2WebComponents.MapDisplay.setZoomDragBoxEndEvent(function() {
        var dragBoxExtent = TerraMA2WebComponents.MapDisplay.getZoomDragBoxExtent();
        TerraMA2WebComponents.MapDisplay.zoomToExtent(dragBoxExtent);
        updateComponents();
      });

      TerraMA2WebComponents.MapDisplay.setMapResolutionChangeEvent(function() {
        Map.setSubtitlesVisibility();
      });

      TerraMA2WebComponents.MapDisplay.setMapDoubleClickEvent(function(longitude, latitude) {
        Utils.getSocket().emit('dataByIntersectionRequest', {
          longitude: longitude,
          latitude: latitude,
          resolution: TerraMA2WebComponents.MapDisplay.getCurrentResolution()
        });
      });

      TerraMA2WebComponents.MapDisplay.setLayerVisibilityChangeEvent(function(layerId) {
        Map.setSubtitlesVisibility(layerId);
      });
    };

    /**
     * Loads the sockets listeners.
     *
     * @private
     * @function loadSocketsListeners
     * @memberof BDQueimadas
     * @inner
     */
    var loadSocketsListeners = function() {

      // Filter Listeners

      Utils.getSocket().on('spatialFilterResponse', function(result) {
        if(result.extent.rowCount > 0) {
          var extent = result.extent.rows[0].extent.replace('BOX(', '').replace(')', '').split(',');
          var extentArray = extent[0].split(' ');
          extentArray = extentArray.concat(extent[1].split(' '));
          TerraMA2WebComponents.MapDisplay.zoomToExtent(extentArray);
          updateComponents();

          if(result.key === 'Continent') {
            Filter.setContinent(result.id);
            Filter.setCountry(null);
            Filter.setState(null);

            applyFilter();

            Utils.getSocket().emit('countriesByContinentRequest', { continent: result.id });

            Filter.enableDropdown('continents', result.text, result.id);
            Filter.enableDropdown('countries', 'Pa&iacute;ses', '');
            Filter.disableDropdown('states', 'Estados', '');
          } else if(result.key === 'Country') {
            Filter.setCountry(result.extent.rows[0].bdq_name);
            Filter.setState(null);

            applyFilter();

            Utils.getSocket().emit('statesByCountryRequest', { country: result.id });

            Filter.enableDropdown('countries', result.text, result.id);
            Filter.enableDropdown('states', 'Estados', '');

            $.each(Utils.getConfigurations().filterConfigurations.CurrentSituationLayers.Layers, function(i, layer) {
              Filter.applyCurrentSituationFilter(Filter.getFormattedDateFrom(Utils.getConfigurations().filterConfigurations.CurrentSituationLayers.DateFormat), Filter.getFormattedDateTo(Utils.getConfigurations().filterConfigurations.CurrentSituationLayers.DateFormat), result.id, Filter.getSatellite(), layer);
            });
          } else {
            Filter.setState(result.extent.rows[0].bdq_name);

            applyFilter();

            Filter.enableDropdown('states', result.text, result.id);
          }
        } else {
          TerraMA2WebComponents.MapDisplay.zoomToInitialExtent();
        }
      });

      Utils.getSocket().on('dataByIntersectionResponse', function(result) {
        if(result.data.rowCount > 0) {
          if(result.data.rows[0].key === "States") {
            Filter.setState(result.data.rows[0].bdq_name);

            applyFilter();

            Filter.selectStateItem(result.data.rows[0].id, result.data.rows[0].name);
          } else if(result.data.rows[0].key === "Countries") {
            Filter.setCountry(result.data.rows[0].bdq_name);
            Filter.setState(null);

            applyFilter();

            Filter.selectCountryItem(result.data.rows[0].id, result.data.rows[0].name);

            $.each(Utils.getConfigurations().filterConfigurations.CurrentSituationLayers.Layers, function(i, layer) {
              Filter.applyCurrentSituationFilter(Filter.getFormattedDateFrom(Utils.getConfigurations().filterConfigurations.CurrentSituationLayers.DateFormat), Filter.getFormattedDateTo(Utils.getConfigurations().filterConfigurations.CurrentSituationLayers.DateFormat), result.data.rows[0].id, Filter.getSatellite(), layer);
            });
          } else {
            Filter.setContinent(result.data.rows[0].id);
            Filter.setCountry(null);
            Filter.setState(null);

            applyFilter();

            Filter.selectContinentItem(result.data.rows[0].id, result.data.rows[0].name);
          }
        } else {
          Utils.getSocket().emit('spatialFilterRequest', { id: Utils.getConfigurations().applicationConfigurations.InitialContinentToFilter, text: Utils.getConfigurations().applicationConfigurations.InitialContinentToFilter, key: 'Continent' });
        }

        updateComponents();
      });

      Utils.getSocket().on('continentByCountryResponse', function(result) {
        Filter.setContinent(result.continent.rows[0].id);

        $('#continents-title').empty().html(result.continent.rows[0].name);

        Utils.getSocket().emit('countriesByContinentRequest', { continent: result.continent.rows[0].id });
      });

      Utils.getSocket().on('continentByStateResponse', function(result) {
        Filter.setContinent(result.continent.rows[0].id);

        $('#continents-title').empty().html(result.continent.rows[0].name);
      });

      Utils.getSocket().on('countryByStateResponse', function(result) {
        Filter.setCountry(result.country.rows[0].bdq_name);

        applyFilter();

        Filter.enableDropdown('countries', result.country.rows[0].name, result.country.rows[0].id);
        Utils.getSocket().emit('statesByCountryRequest', { country: result.country.rows[0].id });

        var html = "",
            countriesCount = result.countries.rowCount;

        for(var i = 0; i < countriesCount; i++) {
          html += "<li class='country-item' id='" + result.countries.rows[i].id + "'><a href='#'>" + result.countries.rows[i].name + "</a></li>";
        }

        $('#countries').empty().html(html);

        $.each(Utils.getConfigurations().filterConfigurations.CurrentSituationLayers.Layers, function(i, layer) {
          Filter.applyCurrentSituationFilter(Filter.getFormattedDateFrom(Utils.getConfigurations().filterConfigurations.CurrentSituationLayers.DateFormat), Filter.getFormattedDateTo(Utils.getConfigurations().filterConfigurations.CurrentSituationLayers.DateFormat), result.country.rows[0].id, Filter.getSatellite(), layer);
        });
      });

      Utils.getSocket().on('countriesByContinentResponse', function(result) {
        var html = "",
            countriesCount = result.countries.rowCount;

        for(var i = 0; i < countriesCount; i++) {
          html += "<li class='country-item' id='" + result.countries.rows[i].id + "'><a href='#'>" + result.countries.rows[i].name + "</a></li>";
        }

        $('#countries').empty().html(html);
      });

      Utils.getSocket().on('statesByCountryResponse', function(result) {
        var html = "",
            statesCount = result.states.rowCount;

        for(var i = 0; i < statesCount; i++) {
          html += "<li class='state-item' id='" + result.states.rows[i].id + "'><a href='#'>" + result.states.rows[i].name + "</a></li>";
        }

        $('#states').empty().html(html);
      });

      // Graphics Listeners

      Utils.getSocket().on('graphicsFiresCountResponse', function(result) {
        Graphics.loadFiresCountGraphic(result);
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
      $(".date").inputmask("yyyy/mm/dd", {"placeholder": "aaaa/mm/dd"});
      $(".date").datepicker({
        dateFormat: 'yy/mm/dd',
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
     * Initializes the necessary features.
     * @param {json} configurations - Configurations object
     * @param {function} callbackFunction - Callback function to be executed when all the components are loaded
     *
     * @function init
     * @memberof BDQueimadas
     * @inner
     */
    var init = function() {
      $(document).ready(function() {
        updateSizeVars();
        setFullContentSize(300);

        loadEvents();
        loadSocketsListeners();
        loadPlugins();

        window.setInterval(function() {
          updateSizeVars();
          updateComponents();
        }, 60000);
      });
    };

    return {
      updateComponents: updateComponents,
    	init: init
    };
  }
);
