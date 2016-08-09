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
      Map.getSubtitlesSatellites(Filter.getSatellites(), Filter.getBiomes(), Filter.getCountriesBdqNames(), Filter.getStatesBdqNames());
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
          closeOnEscape: true,
          closeText: "",
          position: { my: 'top', at: 'top+15' }
        });
      });

      $('#frequently-asked-questions-btn').on('click', function() {
        $('#frequently-asked-questions').dialog({
          width: 800,
          height: 900,
          closeOnEscape: true,
          closeText: "",
          position: { my: 'top', at: 'top+15' }
        });
      });

      $('#presentation-btn').on('click', function() {
        $('#presentation').dialog({
          width: 800,
          height: 900,
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
          $('#page-second-title').css('display', '');
          $('#languages-main').css('display', 'none');
          $('#languages-secondary').css('display', '');
          setReducedContentSize(300);
        } else {
          $("#terrama2-map").addClass('fullmenu');
          $(this).attr('title', 'Expandir Mapa');
          $(this).find('> span').text('Expandir Mapa');
          $('#page-second-title').css('display', 'none');
          $('#languages-main').css('display', '');
          $('#languages-secondary').css('display', 'none');
          setFullContentSize(300);
        }

        // Updates the map size
        TerraMA2WebComponents.MapDisplay.updateMapSize();
      });

      // Window resize event
      $(window).resize(function() {
        // Updates the variables that keep DOM elements sizes
        updateSizeVars();

        // Elements sizes adjustments, accordingly with the sidebar width
        if($("body").hasClass('sidebar-collapse')) {
          setReducedContentSize(0);
        } else {
          setFullContentSize(0);
        }

        // Updates the padding top of the sidebar
        //$('.main-sidebar').attr("style", "padding-top: " + $('.main-header').outerHeight() + "px");

        TerraMA2WebComponents.MapDisplay.updateMapSize();
      });

      // Export click event
      $('#export').on('click', function() {
        vex.dialog.alert({
          message: '<div class="component-filter">' +
            '<div class="component-filter-title">Confirme abaixo as datas e os satélites da exportação. Para alterar a região, use a página principal de filtros.</div>' +
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
                  '<label for="filter-satellite-export" class="col-sm-5 control-label" style="text-align: left;">Focos dos Sat&eacute;lites</label>' +
                  '<div class="col-sm-7"><select multiple class="form-control" id="filter-satellite-export">' + $('#filter-satellite').html() + '</select></div>' +
                '</div>' +
              '</div>' +
              '<div class="form-horizontal">' +
                '<div class="form-group bdqueimadas-form">' +
                  '<label for="filter-biome-export" class="col-sm-5 control-label" style="text-align: left;">Focos dos Biomas</label>' +
                  '<div class="col-sm-7"><select multiple class="form-control" id="filter-biome-export">' + $('#filter-biome').html() + '</select></div>' +
                '</div>' +
              '</div>' +
              '<div class="form-horizontal">' +
                '<div class="form-group bdqueimadas-form">' +
                '<label for="exportation-type" class="col-sm-6 control-label" style="text-align: left;">Formato da exportação</label>' +
                '<div class="col-sm-6">' +
                  '<select id="exportation-type" class="form-control">' +
                    '<option value="csv">CSV</option>' +
                    '<option value="geojson">GeoJSON</option>' +
                    '<option value="kml">KML</option>' +
                    '<option value="shapefile">Shapefile</option>' +
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
              className: 'bdqueimadas-btn teste123'
            },
            {
              type: 'button',
              text: 'Exportar',
              className: 'bdqueimadas-btn',
              click: function() {
                $("#filter-error-export").text('');

                if($("#filter-date-to-export").datepicker('getDate') !== null && $("#filter-date-from-export").datepicker('getDate') !== null) {
                  var timeDiffBetweenDates = Math.abs($("#filter-date-to-export").datepicker('getDate').getTime() - $("#filter-date-from-export").datepicker('getDate').getTime());
                  var diffDaysBetweenDates = Math.ceil(timeDiffBetweenDates / (1000 * 3600 * 24));
                } else {
                  var diffDaysBetweenDates = 0;
                }

                if($("#filter-date-from-export").val() === "") {
                  $("#filter-error-export").text('Data inicial inválida!');
                } else if($("#filter-date-to-export").val() === "") {
                  $("#filter-error-export").text('Data final inválida!');
                } else if($("#filter-date-from-export").datepicker('getDate') > $("#filter-date-to-export").datepicker('getDate')) {
                  $("#filter-error-export").text('Data final anterior à inicial - corrigir!');
                  $("#filter-date-to-export").val('');
                } else if($("#filter-date-from-export").datepicker('getDate') > new Date()) {
                  $("#filter-error-export").text('Data inicial posterior à atual - corrigir!');
                  $("#filter-date-from-export").val('');
                } else if($("#filter-date-to-export").datepicker('getDate') > new Date()) {
                  $("#filter-error-export").text('Data final posterior à atual - corrigir!');
                  $("#filter-date-to-export").val('');
                } else if(diffDaysBetweenDates >= 365) {
                  $("#filter-error-export").text('O período do filtro deve ser menor que 365 dias - corrigir!');
                  $("#filter-date-from-export").val('');
                  $("#filter-date-to-export").val('');
                } else if($('#filter-satellite-export').val() === null) {
                  $("#filter-error-export").text('Selecione algum satélite!');
                } else if($('#filter-biome-export').val() === null) {
                  $("#filter-error-export").text('Selecione algum bioma!');
                } else if($("#exportation-type").val() === "") {
                  $("#filter-error-export").text('Formato da exportação inválido!');
                } else {
                  var countries = (!Utils.stringInArray(Filter.getCountriesBdqNames(), "") && Filter.getCountriesBdqNames().length > 0 ? Filter.getCountriesBdqNames().toString() : '');

                  if((Filter.getContinent() !== null && Filter.getContinent() == Utils.getConfigurations().applicationConfigurations.InitialContinentToFilter) && countries === '') {
                    var initialContinentCountries = Utils.getConfigurations().applicationConfigurations.InitialContinentCountries;
                    var initialContinentCountriesLength = initialContinentCountries.length;

                    for(var i = 0; i < initialContinentCountriesLength; i++) {
                      countries += initialContinentCountries[i].Name + ',';
                    }

                    countries = countries.substring(0, countries.length - 1);
                  }

                  $.ajax({
                    async: false,
                    url: Utils.getBaseUrl() + "exists-data-to-export",
                    type: "GET",
                    data: {
                      dateFrom: Utils.dateToString(Utils.stringToDate($('#filter-date-from-export').val(), 'YYYY/MM/DD'), Utils.getConfigurations().firesDateFormat),
                      dateTo: Utils.dateToString(Utils.stringToDate($('#filter-date-to-export').val(), 'YYYY/MM/DD'), Utils.getConfigurations().firesDateFormat),
                      satellites: (Utils.stringInArray($('#filter-satellite-export').val(), "all") ? '' : $('#filter-satellite-export').val().toString()),
                      biomes: (Utils.stringInArray($('#filter-biome-export').val(), "all") ? '' : $('#filter-biome-export').val().toString()),
                      countries: countries,
                      states: (!Utils.stringInArray(Filter.getStatesBdqNames(), "") && Filter.getStatesBdqNames().length > 0 ? Filter.getStatesBdqNames().toString() : '')
                    },
                    success: function(existsDataToExport) {
                      if(existsDataToExport.existsDataToExport) {
                        var exportLink = Utils.getBaseUrl() + "export?dateFrom=" + Utils.dateToString(Utils.stringToDate($('#filter-date-from-export').val(), 'YYYY/MM/DD'), Utils.getConfigurations().firesDateFormat) +
                                         "&dateTo=" + Utils.dateToString(Utils.stringToDate($('#filter-date-to-export').val(), 'YYYY/MM/DD'), Utils.getConfigurations().firesDateFormat) +
                                         "&satellites=" + (Utils.stringInArray($('#filter-satellite-export').val(), "all") ? '' : $('#filter-satellite-export').val().toString()) +
                                         "&biomes=" + (Utils.stringInArray($('#filter-biome-export').val(), "all") ? '' : $('#filter-biome-export').val().toString()) +
                                         "&countries=" + countries +
                                         "&states=" + (!Utils.stringInArray(Filter.getStatesBdqNames(), "") && Filter.getStatesBdqNames().length > 0 ? Filter.getStatesBdqNames().toString() : '') +
                                         "&format=" + $("#exportation-type").val();

                        window.open(exportLink, '_blank');

                        vex.close();
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
                }
              }
            }
          ]
        });

        $('#filter-date-from-export').blur();

        $("#filter-date-from-export").inputmask("yyyy/mm/dd", {"placeholder": "aaaa/mm/dd"});
        $("#filter-date-to-export").inputmask("yyyy/mm/dd", {"placeholder": "aaaa/mm/dd"});

        var datePickerOptions = $.extend(true, {}, Utils.getConfigurations().applicationConfigurations.DatePickerDefaultOptions);

        datePickerOptions['onSelect'] = function(date) {
          var dateFrom = $('#filter-date-from-export').datepicker('getDate');
          var dateTo = $('#filter-date-to-export').datepicker('getDate');

          if(dateTo !== null && dateFrom !== null) {
            var timeDiffBetweenDates = Math.abs(dateTo.getTime() - dateFrom.getTime());
            var diffDaysBetweenDates = Math.ceil(timeDiffBetweenDates / (1000 * 3600 * 24));
          } else {
            var diffDaysBetweenDates = 0;
          }

          if(dateFrom === null) {
            $("#filter-error-export").text('A data inicial deve ser preenchida primeiro!');
            $("#filter-date-to-export").val('');
          } else if(diffDaysBetweenDates >= 365) {
            $("#filter-error-export").text('O período do filtro deve ser menor que 365 dias - corrigir!');
            $("#filter-date-from-export").val('');
            $("#filter-date-to-export").val('');
          } else {
            if(dateFrom > dateTo && dateTo !== null) {
              $("#filter-error-export").text('Data final anterior à inicial - corrigir!');
              $("#filter-date-from-export").val('');
              $("#filter-date-to-export").val('');
            } else {
              $("#filter-error-export").text('');
            }
          }
        };

        $("#filter-date-from-export").datepicker(datePickerOptions);
        $("#filter-date-to-export").datepicker(datePickerOptions);

        $("#filter-satellite-export").val($("#filter-satellite").val());
        $('#filter-biome-export').val($('#filter-biome').val());
      });

      // Language change event
      $('.languages-item').on('click', function() {
        //console.log($(this).attr('class').split(' ')[1]);
      });

      // Filter Events

      $('#filter-button').on('click', function() {
        var dates = Utils.getFilterDates(true, 0);

        if(dates !== null) {
          var countriesField = $('#countries').val();
          var statesField = $('#states').val();

          if(dates.length === 0) Filter.updateDatesToCurrent();

          if(!Utils.areArraysEqual(Filter.getCountries(), (countriesField == null || (countriesField.length == 1 && countriesField[0] == "") ? [] : countriesField), false)) {
            if(!Utils.stringInArray($('#countries').val(), "") && $('#countries').val().length > 0) {
              Utils.getSocket().emit('spatialFilterRequest', { ids: $('#countries').val(), key: 'Countries', filterForm: true });
              Filter.clearStates();
            } else {
              Utils.getSocket().emit('spatialFilterRequest', { ids: $('#continents').val(), key: 'Continent', filterForm: true });
              Filter.clearCountries();
              Filter.clearStates();
            }
          } else if(!Utils.areArraysEqual(Filter.getStates(), (statesField == null || (statesField.length == 1 && statesField[0] == "") ? [] : statesField), false)) {
            if(!Utils.stringInArray($('#states').val(), "") && $('#states').val().length > 0) {
              Utils.getSocket().emit('spatialFilterRequest', { ids: $('#states').val(), key: 'States', filterForm: true });
            } else {
              Utils.getSocket().emit('spatialFilterRequest', { ids: $('#countries').val(), key: 'Countries', filterForm: true });
              Filter.clearStates();
            }
          } else {
            Filter.checkFiresCount();
          }
        } else {
          $('#filter-satellite').val(Filter.getSatellites());
          $('#filter-biome').val(Filter.getBiomes());
        }
      });

      $('#initial-filter-button').on('click', function() {
        Map.resetMapMouseTools();
        Map.initialExtent();
        Map.activateMoveMapTool();
        Filter.resetDropdowns();

        Filter.updateDatesToCurrent();
        $('#filter-satellite').val('all');
        $('#filter-biome').val('all');

        Filter.applyFilter();
        updateComponents();
      });

      $('#continents').change(function() {
        if($(this).val() !== "")
          Utils.getSocket().emit('spatialFilterRequest', { ids: $(this).val(), key: 'Continent', filterForm: false });
      });

      $('#countries').change(function() {
        $('#filter-button').click();
      });

      $('#states').change(function() {
        $('#filter-button').click();
      });

      $('.filter-date').on('focus', function() {
        if($(this).parent().hasClass('has-error')) {
          $(this).parent().removeClass('has-error');
        }
      });

      $(document).on("updateComponents", function() {
        updateComponents();
      });

      $(document).on("applyFilter", function() {
        Filter.checkFiresCount();
      });

      // Graphics Events

      $('#show-time-series-graphic').on('click', function() {
        Graphics.setTimeSeriesTool();
      });

      $('#filter-button-graphics').on('click', function() {
        Graphics.updateGraphics(true);
      });

      $('#graph-box').on('click', '.export-graphic-data', function() {
        Graphics.exportGraphicData($(this).data('id'));
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
          $('#map-subtitle').animate({ 'width': '350px' }, { duration: 500, queue: false });
          $('.map-subtitle-toggle > i').removeClass('fa-chevron-down').addClass('fa-chevron-up');
        } else {
          $('#map-subtitle').animate({ 'width': '150px' }, { duration: 500, queue: false });
          $('.map-subtitle-toggle > i').removeClass('fa-chevron-up').addClass('fa-chevron-down');
        }
      });

      $(document).on("updateMapInformationsBox", function() {
        var html = getVisibleLayers();

        $('#map-info-box').html(html);
      });

      $('#map-info-button > button').on('click', function() {
        var html = getVisibleLayers();

        $('#map-info-box').html(html);
        $('#map-info-box').dialog({
          dialogClass: "map-info-box",
          title: "Informações do Mapa",
          width: 230,
          maxHeight: 300,
          modal: false,
          resizable: true,
          draggable: true,
          closeOnEscape: true,
          closeText: "",
          position: { my: 'top', at: 'top+15' }
        });
      });

      $('#terrama2-layerexplorer').on('click', 'input.terrama2-layerexplorer-checkbox', function(ev) {
        if($(this).is(":checked")) {
          var parents = $(this).parents('.parent_li').find(' > .group-name > span'),
              parentsLength = parents.length,
              parentsString = "";

          if(parentsLength > 0) {
            for(var i = 0; i < parentsLength; i++) {
              parentsString += parents[i].innerText + " > ";
            }
          }

          Map.addVisibleLayer(
            $(this).parent().data('layerid'),
            $(this).parent().find(' > .terrama2-layerexplorer-checkbox-span').html(),
            $(this).parent().data('parentid'),
            (parentsString !== "" ? parentsString : null),
            $(this).parent().attr('id')
          );
        } else {
          Map.removeVisibleLayer($(this).parent().data('layerid'));
        }

        ev.stopPropagation();
      });

      // LayerExplorer events

      $(document).on('click', '.remove-layer', function() {
        Map.removeLayerFromMap($(this).parent().data('layerid'));

        $('.children:empty').parent().find(' > span > div').addClass('terrama2-layerexplorer-plus').removeClass('terrama2-layerexplorer-minus').html('+');
        $('.children:empty').parent().removeClass('open');
        $('.children:empty').parent().hide();
      });

      $(document).on('click', '.new-layer', function() {
        var layerId = $(this).data('layerid');

        vex.close();

        $.each(Map.getNotAddedLayers(), function(i, layer) {
          if(layerId === layer.Id) {
            if(Utils.getConfigurations().mapConfigurations.UseLayerGroupsInTheLayerExplorer) {
              Map.addLayerToMap(layer, layer.LayerGroup.Id, false);
              $('#' + layer.LayerGroup.Id.replace(':', '')).show();
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

        if(Map.getNotAddedLayers().length > 0) {
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
        } else {
          vex.dialog.alert({
            message: '<p class="text-center">Não existem camadas disponíveis para adicionar ao mapa!</p>',
            buttons: [{
              type: 'submit',
              text: 'Ok',
              className: 'bdqueimadas-btn'
            }]
          });
        }
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

            Filter.checkFiresCount();

            return false;
          }
        });
      });

      // AttributesTable events

      $('#filter-button-attributes-table').on('click', function() {
        AttributesTable.updateAttributesTable(true);
      });

      // Navbar logos events

      $("#page-title").on('click', '.inpe-image', function() {
        window.open('http://www.inpe.br/', '_blank');
      });

      $("#page-title").on('click', '.programa-queimadas-image', function() {
        window.open('http://www.inpe.br/queimadas/', '_blank');
      });

      $("#page-title").on('click', '.defra-image', function() {
        window.open('https://www.gov.uk/government/organisations/department-for-environment-food-rural-affairs', '_blank');
      });

      $("#page-title").on('click', '.banco-mundial-image', function() {
        window.open('http://www.worldbank.org/', '_blank');
      });

      $("#page-title").on('click', '.mma-image', function() {
        window.open('http://www.mma.gov.br/', '_blank');
      });

      $("#page-title").on('click', '.funcate-image', function() {
        window.open('https://www.funcate.org.br/', '_blank');
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
              Filter.checkFiresCount();
            });
          } else {
            Filter.setCountriesBdqNames([]);
            Filter.checkFiresCount();
          }
        } else if(result.key === 'States') {
          if(!Utils.stringInArray(Filter.getStates(), "") && Filter.getStates().length > 0) {
            Filter.updateBdqNames(function() {
              Filter.checkFiresCount();
            });
          } else {
            Filter.setStatesBdqNames([]);
            Filter.checkFiresCount();
          }
        } else {
          Filter.checkFiresCount();
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
            html += "<option value='" + result.countries.rows[i].id + "'>" + (result.countries.rows[i].name === "Falkland Islands" ? "I. Malvinas" : result.countries.rows[i].name) + "</option>";
          }

          $('#countries').empty().html(html);

          Filter.enableDropdown('countries', countriesIds);

          Filter.checkFiresCount();
        });
      });

      Utils.getSocket().on('countriesByContinentResponse', function(result) {
        var initialValue = $('#countries').val();

        var html = "<option value=\"\" selected>Todos os pa&iacute;ses</option>",
            countriesCount = result.countries.rowCount;

        for(var i = 0; i < countriesCount; i++) {
          html += "<option value='" + result.countries.rows[i].id + "'>" + (result.countries.rows[i].name === "Falkland Islands" ? "I. Malvinas" : result.countries.rows[i].name) + "</option>";
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

      Utils.getSocket().on('getSatellitesResponse', function(result) {
        Map.updateSubtitles(result.satellitesList.rows);
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
            var firesAttributes = "";

            $.each(featureInfo.features, function(i, feature) {
              firesAttributes += "<strong>Id:</strong> " + feature.properties[Utils.getConfigurations().filterConfigurations.LayerToFilter.IdFieldName];
              firesAttributes += "<br/><strong>Latitude:</strong> " + feature.properties[Utils.getConfigurations().filterConfigurations.LayerToFilter.LatitudeFieldName] + ' - ' + feature.properties[Utils.getConfigurations().filterConfigurations.LayerToFilter.LatitudeDMSFieldName];
              firesAttributes += "<br/><strong>Longitude:</strong> " + feature.properties[Utils.getConfigurations().filterConfigurations.LayerToFilter.LongitudeFieldName] + ' - ' + feature.properties[Utils.getConfigurations().filterConfigurations.LayerToFilter.LongitudeDMSFieldName];
              firesAttributes += "<br/><strong>Data / Hora:</strong> " + Utils.dateToString(Utils.stringToDate(feature.properties[Utils.getConfigurations().filterConfigurations.LayerToFilter.DateFieldName].toString(), Utils.getConfigurations().filterConfigurations.LayerToFilter.DateFormat), "YYYY/MM/DD") + ' ' + Utils.formatTime(feature.properties[Utils.getConfigurations().filterConfigurations.LayerToFilter.TimeFieldName], Utils.getConfigurations().filterConfigurations.LayerToFilter.TimeFormat, "HH:MM:SS");
              firesAttributes += "<br/><strong>Satélite:</strong> " + feature.properties[Utils.getConfigurations().filterConfigurations.LayerToFilter.SatelliteFieldName];
              firesAttributes += "<br/><strong>Município:</strong> " + feature.properties[Utils.getConfigurations().filterConfigurations.LayerToFilter.CityFieldName];
              firesAttributes += "<br/><strong>Estado / País:</strong> " + feature.properties[Utils.getConfigurations().filterConfigurations.LayerToFilter.StateFieldName] + ' / ' + feature.properties[Utils.getConfigurations().filterConfigurations.LayerToFilter.CountryFieldName];
              firesAttributes += "<br/><strong>Precipitação 24h:</strong> " + feature.properties[Utils.getConfigurations().filterConfigurations.LayerToFilter.PrecipitationFieldName];
              firesAttributes += "<br/><strong>Nº dias sem precipitação:</strong> " + feature.properties[Utils.getConfigurations().filterConfigurations.LayerToFilter.NumberOfDaysWithoutPrecipitationFieldName];
              firesAttributes += "<br/><strong>Risco Fogo / Bioma:</strong> " + feature.properties[Utils.getConfigurations().filterConfigurations.LayerToFilter.RiskFieldName] + ' / ' + feature.properties[Utils.getConfigurations().filterConfigurations.LayerToFilter.BiomeFieldName];
              firesAttributes += "<br/><br/><a target='_blank' href='http://maps.google.com.br/maps?q=" + feature.properties[Utils.getConfigurations().filterConfigurations.LayerToFilter.LatitudeFieldName] + "," + feature.properties[Utils.getConfigurations().filterConfigurations.LayerToFilter.LongitudeFieldName] + "&hl=pt-BR&t=h&z=10'>Veja esse ponto no Google Maps</a>";
              if(featureInfo.features.length > (i + 1)) firesAttributes += "<hr/>";
            });

            $('#feature-info-box').html(firesAttributes);

            $('#feature-info-box').dialog({
              dialogClass: "feature-info-box",
              title: (featureInfo.features.length > 1 ? "Atributos dos focos" : "Atributos do foco"),
              width: 300,
              height: 280,
              modal: false,
              resizable: true,
              draggable: true,
              closeOnEscape: true,
              closeText: "",
              position: { my: 'top', at: 'top+15' }
            });
          }
        }
      });

      Utils.getSocket().on('piwikDataResponse', function(result) {
        if(result.piwikData[0] !== undefined && result.piwikData[0] !== null && result.piwikData[0].nb_visits !== undefined && result.piwikData[0].nb_visits !== null) {
          $('#number-of-accesses > span').text(result.piwikData[0].nb_visits);
          $('#number-of-accesses').show();
        }
      });

      Utils.getSocket().on('checkFiresCountResponse', function(result) {
        if(result.firesCount.rows[0].count >= 200000) {
          //$('#filter-satellite').val(Filter.getSatellites());
          //$('#filter-biome').val(Filter.getBiomes());

          //Filter.updateDatesToCurrent();

          vex.dialog.alert({
            message: '<p class="text-center">Atenção! O número de focos para esse filtro passou de 200.000, esse procedimento vai demorar.</p>',
            buttons: [{
              type: 'submit',
              text: 'Ok',
              className: 'bdqueimadas-btn'
            }]
          });
        }

        Filter.applyFilter();
        updateComponents();
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

      datePickerOptions['onSelect'] = function (date) {
        var dateFrom = $('#filter-date-from').datepicker('getDate');
        var dateTo = $('#filter-date-to').datepicker('getDate');

        if(dateTo !== null && dateFrom !== null) {
          var timeDiffBetweenDates = Math.abs(dateTo.getTime() - dateFrom.getTime());
          var diffDaysBetweenDates = Math.ceil(timeDiffBetweenDates / (1000 * 3600 * 24));
        } else {
          var diffDaysBetweenDates = 0;
        }

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
        } else if(diffDaysBetweenDates >= 365) {
          vex.dialog.alert({
            message: '<p class="text-center">O período do filtro deve ser menor que 365 dias - corrigir!</p>',
            buttons: [{
              type: 'submit',
              text: 'Ok',
              className: 'bdqueimadas-btn'
            }]
          });

          $('#filter-date-from').val('');
          $("#filter-date-to").val('');
        } else {
          if(dateFrom > dateTo && dateTo !== null) {
            vex.dialog.alert({
              message: '<p class="text-center">Data final anterior à inicial - corrigir!</p>',
              buttons: [{
                type: 'submit',
                text: 'Ok',
                className: 'bdqueimadas-btn'
              }]
            });

            $("#filter-date-from").val('');
            $("#filter-date-to").val('');
          }
        }
      };

      $("#filter-date-from").datepicker(datePickerOptions);
      $("#filter-date-to").datepicker(datePickerOptions);

      datePickerOptions['onSelect'] = function (date) {
        var dateFrom = $('#filter-date-from-attributes-table').datepicker('getDate');
        var dateTo = $('#filter-date-to-attributes-table').datepicker('getDate');

        if(dateTo !== null && dateFrom !== null) {
          var timeDiffBetweenDates = Math.abs(dateTo.getTime() - dateFrom.getTime());
          var diffDaysBetweenDates = Math.ceil(timeDiffBetweenDates / (1000 * 3600 * 24));
        } else {
          var diffDaysBetweenDates = 0;
        }

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
        } else if(diffDaysBetweenDates >= 365) {
          vex.dialog.alert({
            message: '<p class="text-center">O período do filtro deve ser menor que 365 dias - corrigir!</p>',
            buttons: [{
              type: 'submit',
              text: 'Ok',
              className: 'bdqueimadas-btn'
            }]
          });

          $('#filter-date-from-attributes-table').val('');
          $('#filter-date-to-attributes-table').val('');
        } else {
          if(dateFrom > dateTo && dateTo !== null) {
            vex.dialog.alert({
              message: '<p class="text-center">Data final anterior à inicial - corrigir!</p>',
              buttons: [{
                type: 'submit',
                text: 'Ok',
                className: 'bdqueimadas-btn'
              }]
            });

            $("#filter-date-from-attributes-table").val('');
            $("#filter-date-to-attributes-table").val('');
          }
        }
      };

      $("#filter-date-from-attributes-table").datepicker(datePickerOptions);
      $("#filter-date-to-attributes-table").datepicker(datePickerOptions);

      datePickerOptions['onSelect'] = function (date) {
        var dateFrom = $('#filter-date-from-graphics').datepicker('getDate');
        var dateTo = $('#filter-date-to-graphics').datepicker('getDate');

        if(dateTo !== null && dateFrom !== null) {
          var timeDiffBetweenDates = Math.abs(dateTo.getTime() - dateFrom.getTime());
          var diffDaysBetweenDates = Math.ceil(timeDiffBetweenDates / (1000 * 3600 * 24));
        } else {
          var diffDaysBetweenDates = 0;
        }

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
        } else if(diffDaysBetweenDates >= 365) {
          vex.dialog.alert({
            message: '<p class="text-center">O período do filtro deve ser menor que 365 dias - corrigir!</p>',
            buttons: [{
              type: 'submit',
              text: 'Ok',
              className: 'bdqueimadas-btn'
            }]
          });

          $('#filter-date-from-graphics').val('');
          $('#filter-date-to-graphics').val('');
        } else {
          if(dateFrom > dateTo && dateTo !== null) {
            vex.dialog.alert({
              message: '<p class="text-center">Data final anterior à inicial - corrigir!</p>',
              buttons: [{
                type: 'submit',
                text: 'Ok',
                className: 'bdqueimadas-btn'
              }]
            });

            $("#filter-date-from-graphics").val('');
            $("#filter-date-to-graphics").val('');
          }
        }
      };

      $("#filter-date-from-graphics").datepicker(datePickerOptions);
      $("#filter-date-to-graphics").datepicker(datePickerOptions);

      $(".sidebar-menu").mousemove(function(e) {
        $(".sidebar-menu").scrollTop(function(i, v) {
          var h = $(window).height();
          var y = e.clientY - h / 2;

          return v + y * 0.1;
        });
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

      $("#page-title > .dynamic-text").html(headerText);

      if($("body").hasClass('sidebar-collapse')) {
        $("#page-second-title").show();
      } else {
        $("#page-second-title").hide();
      }
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
      $("#page-title > .dynamic-text").html("Banco de Dados de Queimadas");

      if($("body").hasClass('sidebar-collapse')) {
        $("#page-second-title").show();
      } else {
        $("#page-second-title").hide();
      }

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

      $('#box-attributes-table').animate({ "height": (memberHeight - ((memberHeaderHeight + memberContentHeaderHeight) + memberReducedFooterHeight + 60)) + "px" }, { duration: duration, queue: false });

      $('.left-content-box').animate({ "height": (memberHeight - ((memberHeaderHeight + memberContentHeaderHeight) + memberReducedFooterHeight)) + "px", "margin-top": (memberHeaderHeight + memberContentHeaderHeight) + "px" }, { duration: duration, queue: false });

      $('.sidebar-menu').animate({ "max-height": (memberHeight - ((memberHeaderHeight + memberContentHeaderHeight) + memberReducedFooterHeight)) + "px" }, { duration: duration, queue: false });
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

      $('#box-attributes-table').animate({ "height": (memberHeight - ((memberNavbarHeight + memberContentHeaderHeight) + memberReducedFooterHeight + 60)) + "px" }, { duration: duration, queue: false });

      $('.left-content-box').animate({ "height": (memberHeight - ((memberNavbarHeight + memberContentHeaderHeight) + memberReducedFooterHeight)) + "px", "margin-top": (memberNavbarHeight + memberContentHeaderHeight) + "px" }, { duration: duration, queue: false });

      $('.sidebar-menu').animate({ "max-height": (memberHeight - ((memberNavbarHeight + memberContentHeaderHeight) + memberReducedFooterHeight)) + "px" }, { duration: duration, queue: false });
    };

    /**
     * Returns the names of the visible layers.
     *
     * @private
     * @function getVisibleLayers
     * @memberof BDQueimadas
     * @inner
     */
    var getVisibleLayers = function() {
      var visibleLayers = Map.getVisibleLayers();
      var html = '';

      if(visibleLayers.length > 0) {
        for(var i = 0, count = visibleLayers.length; i < count; i++) {
          if(visibleLayers[i].parentName !== null) html += visibleLayers[i].parentName;
          html += visibleLayers[i].layerName + '<br/>';
        }
      } else {
        html = '<strong>Nenhuma camada a ser exibida.</strong>';
      }

      return html;
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
        Utils.getSocket().emit('piwikDataRequest');

        $('#footer-brasil a').attr('target', '_blank');

        updateSizeVars();
        setReducedContentSize(300);

        loadEvents();
        loadSocketsListeners();
        loadPlugins();

        TerraMA2WebComponents.MapDisplay.updateMapSize();

        /*window.setInterval(function() {
          updateSizeVars();
          updateComponents();
        }, 60000);*/

        /*setTimeout(function() {
          $('.sidebar-toggle').click();
          $('#main-sidebar-toggle').css('display', '');
        }, 15000);*/

        /*setTimeout(function() {
          if($('#states').val() !== null && !Utils.stringInArray($('#states').val(), "")) {
            Utils.getSocket().emit('spatialFilterRequest', { ids: $('#states').val(), key: 'States', filterForm: true });
          } else if($('#countries').val() !== null && !Utils.stringInArray($('#countries').val(), "")) {
            Utils.getSocket().emit('spatialFilterRequest', { ids: $('#countries').val(), key: 'Countries', filterForm: true });
          } else {
            Utils.getSocket().emit('spatialFilterRequest', { ids: $('#continents').val(), key: 'Continent', filterForm: true });
          }

          Filter.checkFiresCount();
        }, 16000);*/
      });
    };

    return {
    	init: init
    };
  }
);
