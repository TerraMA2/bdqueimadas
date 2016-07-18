"use strict";

/**
 * Graphics class of the BDQueimadas.
 * @class Graphics
 * @variation 2
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberFiresCountGraphics - Graphics of fires count.
 */
define(
  ['components/Utils', 'components/Filter', 'components/Map', 'TerraMA2WebComponents'],
  function(Utils, Filter, Map, TerraMA2WebComponents) {

    // Graphics of fires count
    var memberFiresCountGraphics = {};

    /**
     * Activates or deactivates the time series tool.
     *
     * @function setTimeSeriesTool
     * @memberof Graphics(2)
     * @inner
     */
    var setTimeSeriesTool = function() {
      if($('#show-time-series-graphic').hasClass('active')) {
        Map.resetMapMouseTools();
        Map.activateMoveMapTool();
      } else {
        Map.resetMapMouseTools();
        $('#show-time-series-graphic').addClass('active');
        $('#terrama2-map').addClass('cursor-pointer');
        TerraMA2WebComponents.MapDisplay.setMapSingleClickEvent(function(longitude, latitude) {
          showTimeSeriesGraphic(longitude, latitude, "2000-01", "2000-12");
        });
      }
    };

    /**
     * Shows the time series graphic to the received parameters.
     * @param {float} longitude - Received longitude
     * @param {float} latitude - Received latitude
     * @param {string} start - Time series start month (YYYY-MM)
     * @param {string} end - Time series end month (YYYY-MM)
     *
     * @private
     * @function showTimeSeriesGraphic
     * @memberof Graphics(2)
     * @inner
     */
    var showTimeSeriesGraphic = function(longitude, latitude, start, end) {
      var wtssObj = new wtss(Utils.getConfigurations().graphicsConfigurations.TimeSeries.URL);

      wtssObj.time_series({
        coverage: Utils.getConfigurations().graphicsConfigurations.TimeSeries.Coverage,
        attributes: Utils.getConfigurations().graphicsConfigurations.TimeSeries.Attributes,
        longitude: longitude,
        latitude: latitude,
        start: start,
        end: end
      }, function(data) {
        if(data.result !== undefined) {
          var graphicData = {
            labels: data.result.timeline,
            datasets: [
              {
                label: "Séries Temporais",
                fillColor: "rgb(220,75,56)",
                strokeColor: "rgb(220,75,56)",
                pointColor: "rgb(220,75,56)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgb(220,75,56)",
                data: data.result.attributes[0].values
              }
            ]
          };

          $('#time-series-dialog').dialog({
            width: 855,
            height: 480,
            resizable: false,
            closeOnEscape: true,
            closeText: "",
            position: { my: 'top', at: 'top+15' }
          });

          var htmlElement = $("#time-series").get(0).getContext("2d");

          if(memberFiresCountGraphics["timeSeries"] !== undefined && memberFiresCountGraphics["timeSeries"] !== null)
            memberFiresCountGraphics["timeSeries"].destroy();

          memberFiresCountGraphics["timeSeries"] = new Chart(htmlElement).Line(graphicData, { responsive : true, maintainAspectRatio: true });
        } else {
          throw new Error("Time Series Server Error!");
        }
      });
    };

    /**
     * Updates all the graphics.
     * @param {boolean} useGraphicsFilter - Flag that indicates if the graphics filter should be used
     *
     * @function updateGraphics
     * @memberof Graphics(2)
     * @inner
     */
    var updateGraphics = function(useGraphicsFilter) {
      var dates = Utils.getFilterDates(true, (useGraphicsFilter ? 2 : 0));

      if(dates !== null) {
        if(dates.length === 0) {
          vex.dialog.alert({
            message: '<p class="text-center">Datas inválidas!</p>',
            buttons: [{
              type: 'submit',
              text: 'Ok',
              className: 'bdqueimadas-btn'
            }]
          });
        } else {
          var dateFrom = Utils.dateToString(Utils.stringToDate(dates[0], 'YYYY/MM/DD'), Utils.getConfigurations().firesDateFormat);
          var dateTo = Utils.dateToString(Utils.stringToDate(dates[1], 'YYYY/MM/DD'), Utils.getConfigurations().firesDateFormat);

          var satellites = useGraphicsFilter ?
                           (Utils.stringInArray($('#filter-satellite-graphics').val(), "all") ? '' : $('#filter-satellite-graphics').val().toString()) :
                           Utils.stringInArray(Filter.getSatellites(), "all") ? '' : Filter.getSatellites().toString();

         var biomes = useGraphicsFilter ?
                      (Utils.stringInArray($('#filter-biome-graphics').val(), "all") ? '' : $('#filter-biome-graphics').val().toString()) :
                      Utils.stringInArray(Filter.getBiomes(), "all") ? '' : Filter.getBiomes().toString();

          var extent = TerraMA2WebComponents.MapDisplay.getCurrentExtent();

          if(!useGraphicsFilter) {
            $('#filter-date-from-graphics').val(Filter.getFormattedDateFrom('YYYY/MM/DD'));
            $('#filter-date-to-graphics').val(Filter.getFormattedDateTo('YYYY/MM/DD'));
          }

          $.each(Utils.getConfigurations().graphicsConfigurations.FiresCount, function(i, firesCountGraphicsConfig) {
            if(memberFiresCountGraphics[firesCountGraphicsConfig.Key] === undefined) {
              var htmlElements = "<div class=\"box box-default graphic-item\" style=\"display: none;\"><div class=\"box-header with-border\"><h3 class=\"box-title\">" +
                                 firesCountGraphicsConfig.Title + "<span class=\"additional-title\"> | 0 focos, de " + $('#filter-date-from-graphics').val() + " a " +
                                 $('#filter-date-to-graphics').val() + "</span></h3><div class=\"box-tools pull-right\">" +
                                 "<button type=\"button\" class=\"btn btn-box-tool\" data-widget=\"collapse\"><i class=\"fa fa-minus\"></i></button></div></div>" +
                                 "<div class=\"box-body\" style=\"display: block;\"><div class=\"chart\">" +
                                 "<canvas id=\"fires-count-by-" + firesCountGraphicsConfig.Key + "-graphic\"></canvas>" +
                                 "<a href=\"#\" class=\"btn btn-app export-graphic-data\" data-key=\"" + firesCountGraphicsConfig.Key + "\" data-limit=\"" + firesCountGraphicsConfig.Limit +
                                 "\"><i class=\"fa fa-download\"></i>Exportar Dados em CSV</a>" +
                                 "<div id=\"fires-count-by-" + firesCountGraphicsConfig.Key +
                                 "-graphic-message-container\" class=\"text-center\">" +
                                 "</div></div></div></div>";

              $("#graphics-container").append(htmlElements);
              memberFiresCountGraphics[firesCountGraphicsConfig.Key] = null;
            }

            var countries = (Utils.stringInArray(Filter.getCountriesBdqNames(), "") || Filter.getCountriesBdqNames().length === 0 ? '' : Filter.getCountriesBdqNames().toString());
            var states = (Utils.stringInArray(Filter.getStatesBdqNames(), "") || Filter.getStatesBdqNames().length === 0 ? '' : Filter.getStatesBdqNames().toString());

            Utils.getSocket().emit(
              'graphicsFiresCountRequest',
              {
                dateFrom: dateFrom,
                dateTo: dateTo,
                key: firesCountGraphicsConfig.Key,
                limit: firesCountGraphicsConfig.Limit,
                title: firesCountGraphicsConfig.Title,
                satellites: satellites,
                biomes: biomes,
                extent: extent,
                countries: countries,
                states: states
              }
            );
          });
        }
      }
    };

    /**
     * Loads a given graphic of fires count.
     * @param {json} firesCount - Data to be used in the graphic
     *
     * @function loadFiresCountGraphic
     * @memberof Graphics(2)
     * @inner
     */
    var loadFiresCountGraphic = function(firesCount) {
      var graphHeight = (firesCount.firesCount.rowCount * 20) + 100;
      var labels = [];
      var values = [];

      $.each(firesCount.firesCount.rows, function(i, firesCountItem) {
        labels.push(firesCountItem.key !== null && firesCountItem.key !== undefined && firesCountItem.key !== "" ? firesCountItem.key : "Não Identificado");
        values.push(firesCountItem.count);
      });

      var firesCountGraphicData = {
        labels : labels,
        datasets : [
          {
            backgroundColor : "rgba(220,75,56,0.5)",
            borderColor : "rgba(220,75,56,0.8)",
            hoverBackgroundColor : "rgba(220,75,56,0.75)",
            hoverBorderColor : "rgba(220,75,56,1)",
            data : values
          }
        ]
      };

      if(memberFiresCountGraphics[firesCount.key] !== undefined && memberFiresCountGraphics[firesCount.key] !== null)
        memberFiresCountGraphics[firesCount.key].destroy();

      $("#fires-count-by-" + firesCount.key + "-graphic").attr('height', graphHeight + 'px');
      $("#fires-count-by-" + firesCount.key + "-graphic").css('min-height', graphHeight + 'px');
      $("#fires-count-by-" + firesCount.key + "-graphic").css('max-height', graphHeight + 'px');
      $("#fires-count-by-" + firesCount.key + "-graphic-message-container").hide();
      $("#fires-count-by-" + firesCount.key + "-graphic").show();

      var htmlElement = $("#fires-count-by-" + firesCount.key + "-graphic").get(0).getContext("2d");

      memberFiresCountGraphics[firesCount.key] = new Chart(htmlElement, {
        type: 'horizontalBar',
        data: firesCountGraphicData,
        options: {
          responsive : true,
          maintainAspectRatio: false,
          tooltips: {
            callbacks: {
              label: function(tooltipItems, data) {
                var percentage = ((parseFloat(tooltipItems.xLabel) / parseFloat(firesCount.firesTotalCount.rows[0].count)) * 100).toFixed(1);
                return tooltipItems.xLabel + ' F | ' + percentage + '%';
              }
            }
          },
          legend: {
            display: false
          }
        }
      });

      var additionalTitle = " | " + firesCount.firesTotalCount.rows[0].count + " focos, de " + $('#filter-date-from-graphics').val() + " a " + $('#filter-date-to-graphics').val();
      $("#fires-count-by-" + firesCount.key + "-graphic").parents('.graphic-item').find('.box-title > .additional-title').text(additionalTitle);
      $("#fires-count-by-" + firesCount.key + "-graphic").parent().children('.export-graphic-data').show();
      $("#fires-count-by-" + firesCount.key + "-graphic").parents('.graphic-item').show();

      var countries = (Utils.stringInArray(Filter.getCountriesBdqNames(), "") || Filter.getCountriesBdqNames().length === 0 ? '' : Filter.getCountriesBdqNames().toString());
      var states = (Utils.stringInArray(Filter.getStatesBdqNames(), "") || Filter.getStatesBdqNames().length === 0 ? '' : Filter.getStatesBdqNames().toString());

      if(firesCount.firesCount.rowCount === 0) {
        hideGraphic(firesCount.key);
      } else if(firesCount.key === Utils.getConfigurations().filterConfigurations.LayerToFilter.CityFieldName && states === '') {
        hideGraphic(firesCount.key);
      } else if(firesCount.key === Utils.getConfigurations().filterConfigurations.LayerToFilter.StateFieldName && countries === '') {
        hideGraphic(firesCount.key);
      } else if(firesCount.key === Utils.getConfigurations().filterConfigurations.LayerToFilter.CountryFieldName && countries !== '' && firesCount.firesCount.rowCount === 1) {
        hideGraphic(firesCount.key);
      } else if(firesCount.key === Utils.getConfigurations().filterConfigurations.LayerToFilter.StateFieldName && states !== '' && firesCount.firesCount.rowCount === 1) {
        hideGraphic(firesCount.key);
      }
    };

    /**
     * Hides the graphic with the given key.
     * @param {string} key - Graphic key
     *
     * @private
     * @function hideGraphic
     * @memberof Graphics(2)
     * @inner
     */
    var hideGraphic = function(key) {
      $("#fires-count-by-" + key + "-graphic").parent().children('.export-graphic-data').hide();
      $("#fires-count-by-" + key + "-graphic").parents('.graphic-item').find('.box-title > .additional-title').text(" | 0 focos, de " + $('#filter-date-from-graphics').val() + " a " + $('#filter-date-to-graphics').val());
      $("#fires-count-by-" + key + "-graphic").hide();
      $("#fires-count-by-" + key + "-graphic-message-container").show();
      $("#fires-count-by-" + key + "-graphic-message-container").html('Não existem dados a serem exibidos!');
      $("#fires-count-by-" + key + "-graphic").parents('.graphic-item').hide();
    };

    /**
     * Exports graphic data in csv format.
     * @param {string} key - Graphic key
     * @param {integer} limit - Limit number of rows
     *
     * @function exportGraphicData
     * @memberof Graphics(2)
     * @inner
     */
    var exportGraphicData = function(key, limit) {
      var dates = Utils.getFilterDates(true, 2);

      if(dates !== null) {
        if(dates.length === 0) {
          vex.dialog.alert({
            message: '<p class="text-center">Datas inválidas!</p>',
            buttons: [{
              type: 'submit',
              text: 'Ok',
              className: 'bdqueimadas-btn'
            }]
          });
        } else {
          var dateFrom = Utils.dateToString(Utils.stringToDate(dates[0], 'YYYY/MM/DD'), Utils.getConfigurations().firesDateFormat);
          var dateTo = Utils.dateToString(Utils.stringToDate(dates[1], 'YYYY/MM/DD'), Utils.getConfigurations().firesDateFormat);
          var satellites = (Utils.stringInArray($('#filter-satellite-graphics').val(), "all") ? '' : $('#filter-satellite-graphics').val().toString());
          var biomes = (Utils.stringInArray($('#filter-biome-graphics').val(), "all") ? '' : $('#filter-biome-graphics').val().toString());
          var extent = TerraMA2WebComponents.MapDisplay.getCurrentExtent().toString();
          var countries = (Utils.stringInArray(Filter.getCountriesBdqNames(), "") || Filter.getCountriesBdqNames().length === 0 ? '' : Filter.getCountriesBdqNames().toString());
          var states = (Utils.stringInArray(Filter.getStatesBdqNames(), "") || Filter.getStatesBdqNames().length === 0 ? '' : Filter.getStatesBdqNames().toString());

          var exportLink = Utils.getBaseUrl() + "export-graphic-data?dateFrom=" + dateFrom + "&dateTo=" + dateTo + "&satellites=" + satellites + "&biomes=" + biomes + "&extent=" + extent + "&countries=" + countries + "&states=" + states + "&key=" + key + "&limit=" + limit;
          location.href = exportLink;
        }
      }
    };

    /**
     * Initializes the necessary features.
     *
     * @function init
     * @memberof Graphics(2)
     * @inner
     */
    var init = function() {
      $(document).ready(function() {
        updateGraphics(false);
      });
    };

    return {
      setTimeSeriesTool: setTimeSeriesTool,
      updateGraphics: updateGraphics,
      loadFiresCountGraphic: loadFiresCountGraphic,
      exportGraphicData: exportGraphicData,
      init: init
    };
  }
);
