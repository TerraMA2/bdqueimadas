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
     * @private
     * @function updateComponents
     * @memberof BDQueimadas
     * @inner
     */
    var updateComponents = function() {
      AttributesTable.updateAttributesTable(false);
      Graphics.updateGraphics(false);
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

      $('#about-btn').on('click', function() {
        $('#about-dialog').dialog({
          width: 800,
          height: 900,
          modal: true,
          resizable: false,
          draggable: false,
          closeOnEscape: true,
          closeText: "",
          position: { my: 'top', at: 'top+15' }
        });
      });

      // Sidebar buttons click event
      $(".sidebar-menu > li.left-box").on('click', function(event) {
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
          $(this).attr('title', 'Diminuir Mapa');
          $(this).find('> span').text('Diminuir Mapa');
          setReducedContentSize(300);
        } else {
          $("#terrama2-map").addClass('fullmenu');
          $(this).attr('title', 'Expandir Mapa');
          $(this).find('> span').text('Expandir Mapa');
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
          $('.ol-scale-line').animate({ 'right': '60px' }, { duration: 300, queue: false });
          $('#terrama2-map-info').animate({ 'right': '60px' }, { duration: 300, queue: false });
        } else {
          $('.ol-zoom').animate({ 'right': '15px' }, { duration: 300, queue: false });
          $('.ol-attribution').animate({ 'right': '15px' }, { duration: 300, queue: false });
          $('#map-subtitle').animate({ 'right': '0' }, { duration: 300, queue: false });
          $('.ol-scale-line').animate({ 'right': '15px' }, { duration: 300, queue: false });
          $('#terrama2-map-info').animate({ 'right': '15px' }, { duration: 300, queue: false });
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
            satellites: (Utils.stringInArray(Filter.getSatellites(), "all") ? '' : Filter.getSatellites().toString()),
            extent: TerraMA2WebComponents.MapDisplay.getCurrentExtent().toString(),
            countries: (!Utils.stringInArray(Filter.getCountriesBdqNames(), "") && Filter.getCountriesBdqNames().length > 0 ? Filter.getCountriesBdqNames().toString() : ''),
            states: (!Utils.stringInArray(Filter.getStatesBdqNames(), "") && Filter.getStatesBdqNames().length > 0 ? Filter.getStatesBdqNames().toString() : '')
          },
          success: function(existsDataToExport) {
            if(existsDataToExport.existsDataToExport) {
              vex.dialog.alert({
                message: '<div class="component-filter">' +
                  '<div class="component-filter-title">Confirme abaixo os filtros de datas e de satélites da exportação (os filtros espaciais devem ser parametrizados no filtro principal)</div>' +
                  '<div class="component-filter-content">' +
                    '<div class="form-group bdqueimadas-form">' +
                      '<div class="float-left div-date-filter-export">' +
                        '<label for="filter-date-from-export">Início</label>' +
                        '<input value="' + $('#filter-date-from').val() + '" type="text" class="form-control float-left" id="filter-date-from-export" placeholder="De">' +
                      '</div>' +
                      '<div class="float-right div-date-filter-export">' +
                        '<label for="filter-date-to-export">Fim</label>' +
                        '<input value="' + $('#filter-date-to').val() + '" type="text" class="form-control float-left" id="filter-date-to-export" placeholder="Até">' +
                      '</div>' +
                    '</div>' +
                    '<div class="clear" style="height: 5px;"></div>' +
                    '<div class="form-horizontal">' +
                      '<div class="form-group bdqueimadas-form">' +
                        '<label for="filter-satellite-export" class="col-sm-5 control-label text-left">Focos dos Sat&eacute;lites</label>' +
                        '<div class="col-sm-7"><select multiple class="form-control" id="filter-satellite-export">"' + $('#filter-satellite').html() + '</select></div>' +
                      '</div>' +
                    '</div>' +
                    '<div class="form-horizontal">' +
                      '<div class="form-group bdqueimadas-form">' +
                      '<label for="exportation-type" class="col-sm-6 control-label text-left">Formato da exportação</label>' +
                      '<div class="col-sm-6">' +
                        '<select id="exportation-type" class="form-control">' +
                          '<option value="">Selecione o formato</option>' +
                          '<option value="geojson">GeoJSON</option>' +
                          '<option value="shapefile">Shapefile</option>' +
                          '<option value="csv">CSV</option>' +
                        '</select>' +
                      '</div>' +
                      '</div>' +
                    '</div>' +
                    '<div class="clear"></div>' +
                    '<span class="help-block component-filter-error" id="filter-error-export"></span>' +
                  '</div>' +
                '</div>',
                buttons: [
                  {
                    type: 'submit',
                    text: 'Cancelar',
                    className: 'bdqueimadas-btn'
                  },
                  {
                    type: 'button',
                    text: 'Exportar',
                    className: 'bdqueimadas-btn',
                    click: function() {
                      $("#filter-error-export").text('');

                      if($("#filter-date-from-export").val() === "") {
                        $("#filter-error-export").text('Data inicial inválida!');
                      } else if($("#filter-date-to-export").val() === "") {
                        $("#filter-error-export").text('Data final inválida!');
                      } else if($('#filter-satellite-export').val() === null) {
                        $("#filter-error-export").text('Selecione algum satélite!');
                      } else if($("#exportation-type").val() === "") {
                        $("#filter-error-export").text('Formato da exportação inválido!');
                      } else {
                        var exportLink = Utils.getBaseUrl() + "export?dateFrom=" + Utils.dateToString(Utils.stringToDate($('#filter-date-from-export').val(), 'YYYY/MM/DD'), Utils.getConfigurations().firesDateFormat) +
                                         "&dateTo=" + Utils.dateToString(Utils.stringToDate($('#filter-date-to-export').val(), 'YYYY/MM/DD'), Utils.getConfigurations().firesDateFormat) +
                                         "&satellites=" + (Utils.stringInArray($('#filter-satellite-export').val(), "all") ? '' : $('#filter-satellite-export').val().toString()) +
                                         "&extent=" + TerraMA2WebComponents.MapDisplay.getCurrentExtent().toString() +
                                         "&countries=" + (!Utils.stringInArray(Filter.getCountriesBdqNames(), "") && Filter.getCountriesBdqNames().length > 0 ? Filter.getCountriesBdqNames().toString() : '') +
                                         "&states=" + (!Utils.stringInArray(Filter.getStatesBdqNames(), "") && Filter.getStatesBdqNames().length > 0 ? Filter.getStatesBdqNames().toString() : '') +
                                         "&format=" + $("#exportation-type").val();

                        location.href = exportLink;

                        vex.close();
                      }
                    }
                  }
                ]
              });

              $('#filter-date-from-export').blur();

              $("#filter-date-from-export").inputmask("yyyy/mm/dd", {"placeholder": "aaaa/mm/dd"});
              $("#filter-date-to-export").inputmask("yyyy/mm/dd", {"placeholder": "aaaa/mm/dd"});

              var datePickerOptions = $.extend(true, {}, Utils.getConfigurations().applicationConfigurations.DatePickerDefaultOptions);

              $("#filter-date-from-export").datepicker(datePickerOptions);

              datePickerOptions['onSelect'] = function(date) {
                var dateFrom = $('#filter-date-from-export').datepicker('getDate');
                var dateTo = $(this).datepicker('getDate');

                if(dateFrom === null) {
                  $("#filter-error-export").text('A data inicial deve ser preenchida primeiro!');
                  $("#filter-date-to-export").val('');
                } else {
                  if(dateFrom > dateTo) {
                    $("#filter-error-export").text('Data final anterior à inicial - corrigir!');
                    $("#filter-date-to-export").val('');
                  } else {
                    $("#filter-error-export").text('');
                  }
                }
              };

              $("#filter-date-to-export").datepicker(datePickerOptions);

              $("#filter-satellite-export").val($("#filter-satellite").val());
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
        var dates = Utils.getFilterDates(true);

        if(dates !== null) {
          if(!Utils.areArraysEqual(Filter.getCountries(), $('#countries').val(), false)) {
            if(!Utils.stringInArray($('#countries').val(), "") && $('#countries').val().length > 0) {
              Utils.getSocket().emit('spatialFilterRequest', { ids: $('#countries').val(), key: 'Countries', filterForm: true });
              Filter.clearStates();
            } else {
              Utils.getSocket().emit('spatialFilterRequest', { ids: $('#continents').val(), key: 'Continent', filterForm: true });
              Filter.clearCountries();
              Filter.clearStates();
            }
          } else if(!Utils.areArraysEqual(Filter.getStates(), $('#states').val(), false)) {
            if(!Utils.areArraysEqual(Filter.getStates(), $('#states').val(), false)) {
              if(!Utils.stringInArray($('#states').val(), "") && $('#states').val().length > 0) {
                Utils.getSocket().emit('spatialFilterRequest', { ids: $('#states').val(), key: 'States', filterForm: true });
              } else {
                Utils.getSocket().emit('spatialFilterRequest', { ids: $('#countries').val(), key: 'Countries', filterForm: true });
                Filter.clearStates();
              }
            }
          } else {
            Filter.applyFilter();
            updateComponents();
          }
        } else {
          $('#filter-satellite').val(Filter.getSatellites());
        }
      });

      $('#continents').change(function() {
        if($(this).val() !== "")
          Utils.getSocket().emit('spatialFilterRequest', { ids: $(this).val(), key: 'Continent', filterForm: false });
      });

      $('.filter-date').on('focus', function() {
        if($(this).parent().hasClass('has-error')) {
          $(this).parent().removeClass('has-error');
        }
      });

      $('#updateComponents').on('click', function() {
        updateComponents();
      });

      $(document).on("updateComponents", function() {
        updateComponents();
      });

      $(document).on("applyFilter", function() {
        Filter.applyFilter();
        updateComponents();
      });

      // Graphics Events

      $('#show-time-series-graphic').on('click', function() {
        Graphics.setTimeSeriesTool();
      });

      $('#filter-button-graphics').on('click', function() {
        Graphics.updateGraphics(true);
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

      $('#getAttributes').on('click', function() {
        Map.resetMapMouseTools();
        Map.activateGetFeatureInfoTool();
      });

      $('.map-subtitle-toggle').on('click', function() {
        Map.updateZoomTop(true);

        if($('#map-subtitle > div').hasClass('collapsed-box')) {
          $('#map-subtitle').animate({ 'width': '25%' }, { duration: 500, queue: false });
          $('.map-subtitle-toggle > i').removeClass('fa-chevron-down').addClass('fa-chevron-up');
          $(this).attr('title', 'Esconder Legendas');
        } else {
          $('#map-subtitle').animate({ 'width': '150px' }, { duration: 500, queue: false });
          $('.map-subtitle-toggle > i').removeClass('fa-chevron-up').addClass('fa-chevron-down');
          $(this).attr('title', 'Exibir Legendas');
        }
      });

      // LayerExplorer events

      $(document).on('click', '.remove-layer', function() {
        Map.removeLayerFromMap($(this).parent().data('layerid'));
      });

      $(document).on('click', '.new-layer', function() {
        var layerId = $(this).data('layerid');

        vex.close();

        $.each(Map.getNotAddedLayers(), function(i, layer) {
          if(layerId === layer.Id) {
            if(Utils.getConfigurations().mapConfigurations.UseLayerGroupsInTheLayerExplorer) {
              Map.addLayerToMap(layer, layer.LayerGroup.Id, false);
            } else {
              Map.addLayerToMap(layer, 'terrama2-layerexplorer', false);
            }

            return false;
          }
        });
      });

      $('#add-layer').on('click', function() {
        var layerGroups = {
          "LayerGroupsIds": [],
          "LayerGroupsNames": []
        };

        $.each(Map.getNotAddedLayers(), function(i, layer) {
          var layerHtml = "<li style=\"display: none;\">" + Utils.processStringWithDatePattern(layer.Name) + "<span class=\"new-layer\" data-layerid=\"" + layer.Id + "\"><a href=\"#\">Adicionar</a></span></li>";

          if(layerGroups[layer.LayerGroup.Id] !== undefined) {
            layerGroups[layer.LayerGroup.Id] += layerHtml;
          } else {
            layerGroups[layer.LayerGroup.Id] = layerHtml;

            layerGroups.LayerGroupsIds.push(layer.LayerGroup.Id);
            layerGroups.LayerGroupsNames.push(layer.LayerGroup.Name);
          }
        });

        var availableLayers = "<h4 class=\"text-center\"><strong>Camadas dispon&iacute;veis:</strong></h4>";
        availableLayers += "<div id=\"available-layers\">";

        $.each(layerGroups.LayerGroupsIds, function(i, layerGroupId) {
          availableLayers += "<span class=\"span-group-name\" data-available-layer-group=\"layer-group-" + layerGroupId + "\"><div class=\"layer-group-plus\">+</div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong>" + layerGroups.LayerGroupsNames[i] + "</strong></span>";
          availableLayers += "<ul id=\"layer-group-" + layerGroupId + "\">" + layerGroups[layerGroupId] + "</ul>";
        });

        availableLayers += "</div>";

        $('#available-layers li').hide();

        vex.dialog.alert({
          message: availableLayers,
          buttons: [{
            type: 'submit',
            text: 'Fechar',
            className: 'bdqueimadas-btn'
          }]
        });
      });

      $(document).on('click', '#available-layers > span.span-group-name', function(ev) {
        var children = $("#" + $(this).data('available-layer-group')).find(' > li');

        if(children.is(":visible")) {
          children.hide('fast');
          $(this).find('div').addClass('layer-group-plus').removeClass('layer-group-minus').html('+');
        } else {
          children.show('fast');
          $(this).find('div').addClass('layer-group-minus').removeClass('layer-group-plus').html('-');
        }
      });

      $(document).on('click', '.layer-time-update', function() {
        if(!$("#hidden-layer-time-update-" + $(this).data("id")).hasClass('hasDatepicker')) {
          $("#hidden-layer-time-update-" + $(this).data("id")).datepicker(Utils.getConfigurations().applicationConfigurations.DatePickerDefaultOptions);
        }

        $("#hidden-layer-time-update-" + $(this).data("id")).datepicker("show");
      });

      $(document).on('change', '.hidden-layer-time-update', function() {
        var self = $(this);

        $.each(Map.getLayers(), function(j, layer) {
          if(layer.Id === self.data('id')) {
            layer.Time = Utils.dateToString(Utils.stringToDate(self.val(), 'YYYY/MM/DD'), 'YYYY-MM-DD');

            self.parent().find('> span.layer-time-update > a').text(self.val());
            self.parent().find('> input.hidden-layer-time-update').removeClass('hasDatepicker');
            layer.Name = self.parent().html();

            Filter.applyFilter();
            updateComponents();

            return false;
          }
        });
      });

      // AttributesTable events

      $('#filter-button-attributes-table').on('click', function() {
        AttributesTable.updateAttributesTable(true);
      });

      // TerraMA2WebComponents events

      TerraMA2WebComponents.MapDisplay.setLayersStartLoadingFunction(function() {
        if($('#loading-span').hasClass('hide')) $('#loading-span').removeClass('hide');
      });

      TerraMA2WebComponents.MapDisplay.setLayersEndLoadingFunction(function() {
        if(!$('#loading-span').hasClass('hide')) $('#loading-span').addClass('hide');
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

          if(result.key === 'Continent') {
            Filter.setContinent(result.ids);
            Filter.clearCountries();
            Filter.clearStates();

            Utils.getSocket().emit('countriesByContinentRequest', { continent: result.ids });

            Filter.enableDropdown('continents', result.ids);
            Filter.enableDropdown('countries', '');
            Filter.disableDropdown('states', '');
          } else if(result.key === 'Countries') {
            Filter.setCountries(result.ids);
            Filter.clearStates();

            Utils.getSocket().emit('statesByCountriesRequest', { countries: result.ids });

            Filter.enableDropdown('countries', result.ids);
            Filter.enableDropdown('states', '');
          } else {
            Filter.setStates(result.ids);

            Filter.enableDropdown('states', result.ids);
          }
        } else {
          TerraMA2WebComponents.MapDisplay.zoomToInitialExtent();
        }

        if(result.key === 'Countries') {
          if(!Utils.stringInArray(Filter.getCountries(), "") && Filter.getCountries().length > 0) {
            Filter.updateBdqNames(function() {
              Filter.applyFilter();
              updateComponents();
            });
          } else {
            Filter.setCountriesBdqNames([]);
            Filter.applyFilter();
            updateComponents();
          }
        } else if(result.key === 'States') {
          if(!Utils.stringInArray(Filter.getStates(), "") && Filter.getStates().length > 0) {
            Filter.updateBdqNames(function() {
              Filter.applyFilter();
              updateComponents();
            });
          } else {
            Filter.setStatesBdqNames([]);
            Filter.applyFilter();
            updateComponents();
          }
        } else {
          Filter.applyFilter();
          updateComponents();
        }
      });

      Utils.getSocket().on('dataByIntersectionResponse', function(result) {
        if(result.data.rowCount > 0) {
          if(result.data.rows[0].key === "States") {
            Filter.setStates([result.data.rows[0].id]);
            Filter.selectStates([result.data.rows[0].id]);
          } else if(result.data.rows[0].key === "Countries") {
            Filter.setCountries([result.data.rows[0].id]);
            Filter.clearStates();
            Filter.selectCountries([result.data.rows[0].id]);
          } else {
            Filter.setContinent(result.data.rows[0].id);
            Filter.clearCountries();
            Filter.clearStates();

            Filter.selectContinentItem(result.data.rows[0].id, result.data.rows[0].name);
          }
        } else {
          Utils.getSocket().emit('spatialFilterRequest', { ids: Utils.getConfigurations().applicationConfigurations.InitialContinentToFilter, key: 'Continent', filterForm: false });
        }

        updateComponents();
      });

      Utils.getSocket().on('continentByCountryResponse', function(result) {
        Filter.setContinent(result.continent.rows[0].id);

        Filter.enableDropdown('continents', result.continent.rows[0].id);

        Utils.getSocket().emit('countriesByContinentRequest', { continent: result.continent.rows[0].id });
      });

      Utils.getSocket().on('continentByStateResponse', function(result) {
        Filter.setContinent(result.continent.rows[0].id);

        Filter.enableDropdown('continents', result.continent.rows[0].id);
      });

      Utils.getSocket().on('countriesByStatesResponse', function(result) {
        var countriesIds = [];

        for(var i = 0; i < result.countriesByStates.rowCount; i++) {
          countriesIds.push(result.countriesByStates.rows[i].id);
        }

        Filter.setCountries(countriesIds);

        Filter.updateBdqNames(function() {
          Utils.getSocket().emit('statesByCountriesRequest', { countries: countriesIds });

          var html = "<option value=\"\" selected>Todos os pa&iacute;ses</option>",
              countriesCount = result.countries.rowCount;

          for(var i = 0; i < countriesCount; i++) {
            html += "<option value='" + result.countries.rows[i].id + "'>" + result.countries.rows[i].name + "</option>";
          }

          $('#countries').empty().html(html);

          Filter.enableDropdown('countries', countriesIds);

          Filter.applyFilter();
          updateComponents();
        });
      });

      Utils.getSocket().on('countriesByContinentResponse', function(result) {
        var initialValue = $('#countries').val();

        var html = "<option value=\"\" selected>Todos os pa&iacute;ses</option>",
            countriesCount = result.countries.rowCount;

        for(var i = 0; i < countriesCount; i++) {
          html += "<option value='" + result.countries.rows[i].id + "'>" + result.countries.rows[i].name + "</option>";
        }

        // todo: correct bellows block

        $('#countries').empty().html(html);
        if($('#countries').attr('data-value') === "") {
          $('#countries').val(initialValue);
        } else {
          $('#countries').val($('#countries').attr('data-value'));
        }
      });

      Utils.getSocket().on('statesByCountryResponse', function(result) {
        var initialValue = $('#states').val();

        var html = "<option value=\"\" selected>Todos os estados</option>",
            statesCount = result.states.rowCount;

        for(var i = 0; i < statesCount; i++) {
          html += "<option value='" + result.states.rows[i].id + "'>" + result.states.rows[i].name + "</option>";
        }

        // todo: correct bellows block

        $('#states').empty().html(html);
        if($('#states').attr('data-value') === "") {
          $('#states').val(initialValue);
        } else {
          $('#states').val($('#states').attr('data-value'));
        }
      });

      Utils.getSocket().on('statesByCountriesResponse', function(result) {
        var initialValue = $('#states').val();

        var html = "<option value=\"\" selected>Todos os estados</option>",
            statesCount = result.states.rowCount;

        for(var i = 0; i < statesCount; i++) {
          html += "<option value='" + result.states.rows[i].id + "'>" + result.states.rows[i].name + "</option>";
        }

        // todo: correct bellows block

        $('#states').empty().html(html);
        if($('#states').attr('data-value') === "") {
          $('#states').val(initialValue);
        } else {
          $('#states').val($('#states').attr('data-value'));
        }
      });

      // Graphics Listeners

      Utils.getSocket().on('graphicsFiresCountResponse', function(result) {
        Graphics.loadFiresCountGraphic(result);
      });

      // Proxy Listeners

      Utils.getSocket().on('proxyResponse', function(result) {
        if(result.requestId === 'GetFeatureInfoTool') {
          var featureInfo = JSON.parse(result.msg);

          if(featureInfo.features.length > 0) {
            var firesAttributes = "<h4 class=\"text-center\"><strong>" + (featureInfo.features.length > 1 ? "Atributos dos focos:" : "Atributos do foco:") + "</strong></h4>";
            firesAttributes += "<div style=\"max-height: 400px; overflow: auto;\">";

            $.each(featureInfo.features, function(i, feature) {
              firesAttributes += "<strong>Id:</strong> " + feature.properties[Utils.getConfigurations().filterConfigurations.LayerToFilter.IdFieldName];
              firesAttributes += "<br/><strong>Latitude:</strong> " + feature.properties[Utils.getConfigurations().filterConfigurations.LayerToFilter.LatitudeFieldName];
              firesAttributes += "<br/><strong>Longitude:</strong> " + feature.properties[Utils.getConfigurations().filterConfigurations.LayerToFilter.LongitudeFieldName];
              firesAttributes += "<br/><strong>Latitude GMS:</strong> " + feature.properties[Utils.getConfigurations().filterConfigurations.LayerToFilter.LatitudeDMSFieldName];
              firesAttributes += "<br/><strong>Longitude GMS:</strong> " + feature.properties[Utils.getConfigurations().filterConfigurations.LayerToFilter.LongitudeDMSFieldName];
              firesAttributes += "<br/><strong>Data:</strong> " + Utils.dateToString(Utils.stringToDate(feature.properties[Utils.getConfigurations().filterConfigurations.LayerToFilter.DateFieldName].toString(), Utils.getConfigurations().filterConfigurations.LayerToFilter.DateFormat), "YYYY/MM/DD");
              firesAttributes += "<br/><strong>Hora:</strong> " + Utils.formatTime(feature.properties[Utils.getConfigurations().filterConfigurations.LayerToFilter.TimeFieldName], Utils.getConfigurations().filterConfigurations.LayerToFilter.TimeFormat, "HH:MM:SS");
              firesAttributes += "<br/><strong>Satélite:</strong> " + feature.properties[Utils.getConfigurations().filterConfigurations.LayerToFilter.SatelliteFieldName];
              firesAttributes += "<br/><strong>Município:</strong> " + feature.properties[Utils.getConfigurations().filterConfigurations.LayerToFilter.CityFieldName];
              firesAttributes += "<br/><strong>Estado:</strong> " + feature.properties[Utils.getConfigurations().filterConfigurations.LayerToFilter.StateFieldName];
              firesAttributes += "<br/><strong>País:</strong> " + feature.properties[Utils.getConfigurations().filterConfigurations.LayerToFilter.CountryFieldName];
              firesAttributes += "<br/><strong>Precipitação:</strong> " + feature.properties[Utils.getConfigurations().filterConfigurations.LayerToFilter.PrecipitationFieldName];
              firesAttributes += "<br/><strong>Número de dias sem precipitação:</strong> " + feature.properties[Utils.getConfigurations().filterConfigurations.LayerToFilter.NumberOfDaysWithoutPrecipitationFieldName];
              firesAttributes += "<br/><strong>Risco:</strong> " + feature.properties[Utils.getConfigurations().filterConfigurations.LayerToFilter.RiskFieldName];
              firesAttributes += "<br/><strong>Bioma:</strong> " + feature.properties[Utils.getConfigurations().filterConfigurations.LayerToFilter.BiomeFieldName];
              firesAttributes += "<br/><br/><a target='_blank' href='http://maps.google.com.br/maps?q=" + feature.properties[Utils.getConfigurations().filterConfigurations.LayerToFilter.LatitudeFieldName] + "," + feature.properties[Utils.getConfigurations().filterConfigurations.LayerToFilter.LongitudeFieldName] + "&hl=pt-BR&t=h&z=10'>Veja esse ponto no Google Maps</a>";
              if(featureInfo.features.length > (i + 1)) firesAttributes += "<hr/>";
            });

            firesAttributes += "</div>";

            vex.dialog.alert({
              message: firesAttributes,
              buttons: [{
                type: 'submit',
                text: 'Fechar',
                className: 'bdqueimadas-btn'
              }]
            });
          }
        }
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

      var datePickerOptions = $.extend(true, {}, Utils.getConfigurations().applicationConfigurations.DatePickerDefaultOptions);

      $(".filter-date-from").datepicker(datePickerOptions);

      datePickerOptions['onSelect'] = function (date) {
        var dateFrom = $('#filter-date-from').datepicker('getDate');
        var dateTo = $(this).datepicker('getDate');

        if(dateFrom === null) {
          vex.dialog.alert({
            message: '<p class="text-center">A data inicial deve ser preenchida primeiro!</p>',
            buttons: [{
              type: 'submit',
              text: 'Ok',
              className: 'bdqueimadas-btn'
            }]
          });

          $("#filter-date-to").val('');
        } else {
          if(dateFrom > dateTo) {
            vex.dialog.alert({
              message: '<p class="text-center">Data final anterior à inicial - corrigir!</p>',
              buttons: [{
                type: 'submit',
                text: 'Ok',
                className: 'bdqueimadas-btn'
              }]
            });

            $("#filter-date-to").val('');
          }
        }
      };

      $("#filter-date-to").datepicker(datePickerOptions);

      datePickerOptions['onSelect'] = function (date) {
        var dateFrom = $('#filter-date-from-attributes-table').datepicker('getDate');
        var dateTo = $(this).datepicker('getDate');

        if(dateFrom === null) {
          vex.dialog.alert({
            message: '<p class="text-center">A data inicial deve ser preenchida primeiro!</p>',
            buttons: [{
              type: 'submit',
              text: 'Ok',
              className: 'bdqueimadas-btn'
            }]
          });

          $("#filter-date-to-attributes-table").val('');
        } else {
          if(dateFrom > dateTo) {
            vex.dialog.alert({
              message: '<p class="text-center">Data final anterior à inicial - corrigir!</p>',
              buttons: [{
                type: 'submit',
                text: 'Ok',
                className: 'bdqueimadas-btn'
              }]
            });

            $("#filter-date-to-attributes-table").val('');
          }
        }
      };

      $("#filter-date-to-attributes-table").datepicker(datePickerOptions);

      datePickerOptions['onSelect'] = function (date) {
        var dateFrom = $('#filter-date-from-graphics').datepicker('getDate');
        var dateTo = $(this).datepicker('getDate');

        if(dateFrom === null) {
          vex.dialog.alert({
            message: '<p class="text-center">A data inicial deve ser preenchida primeiro!</p>',
            buttons: [{
              type: 'submit',
              text: 'Ok',
              className: 'bdqueimadas-btn'
            }]
          });

          $("#filter-date-to-graphics").val('');
        } else {
          if(dateFrom > dateTo) {
            vex.dialog.alert({
              message: '<p class="text-center">Data final anterior à inicial - corrigir!</p>',
              buttons: [{
                type: 'submit',
                text: 'Ok',
                className: 'bdqueimadas-btn'
              }]
            });

            $("#filter-date-to-graphics").val('');
          }
        }
      };

      $("#filter-date-to-graphics").datepicker(datePickerOptions);
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

      $("#page-title").html(headerText);
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
      $("#page-title").html("Banco de Dados de Queimadas");
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

      $('.left-content-box').animate({ "height": (memberHeight - ((memberHeaderHeight + memberContentHeaderHeight) + memberReducedFooterHeight)) + "px", "margin-top": (memberHeaderHeight + memberContentHeaderHeight + 10) + "px" }, { duration: duration, queue: false });
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

      $('.left-content-box').animate({ "height": (memberHeight - ((memberNavbarHeight + memberContentHeaderHeight) + memberReducedFooterHeight)) + "px", "margin-top": (memberNavbarHeight + memberContentHeaderHeight + 10) + "px" }, { duration: duration, queue: false });
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

        setTimeout(function() {
          $('.sidebar-toggle').click();
          $('#main-sidebar-toggle').css('display', '');
        }, 15000);

        setTimeout(function() {
          if($('#states').val() !== null && !Utils.stringInArray($('#states').val(), "")) {
            Utils.getSocket().emit('spatialFilterRequest', { ids: $('#states').val(), key: 'States', filterForm: true });
          } else if($('#countries').val() !== null && !Utils.stringInArray($('#countries').val(), "")) {
            Utils.getSocket().emit('spatialFilterRequest', { ids: $('#countries').val(), key: 'Countries', filterForm: true });
          } else {
            Utils.getSocket().emit('spatialFilterRequest', { ids: $('#continents').val(), key: 'Continent', filterForm: true });
          }
        }, 16000);
      });
    };

    return {
    	init: init
    };
  }
);
