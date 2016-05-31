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
      if($('#show-time-series-graphic > i').hasClass('active')) {
        Map.resetMapMouseTools();
        Map.activateMoveMapTool();
      } else {
        Map.resetMapMouseTools();
        $('#show-time-series-graphic > i').addClass('active');
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
                fillColor: "rgba(220,220,220,0.2)",
                strokeColor: "rgba(220,220,220,1)",
                pointColor: "rgba(220,220,220,1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(220,220,220,1)",
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
     *
     * @function updateGraphics
     * @memberof Graphics(2)
     * @inner
     */
    var updateGraphics = function() {
      if($("#graph-box").css('left') < '0px') {
        var dateFrom = Filter.getFormattedDateFrom(Utils.getConfigurations().firesDateFormat);
        var dateTo = Filter.getFormattedDateTo(Utils.getConfigurations().firesDateFormat);
        var satellite = Filter.getSatellite() !== "all" ? Filter.getSatellite() : '';
        var extent = TerraMA2WebComponents.MapDisplay.getCurrentExtent();

        $.each(Utils.getConfigurations().graphicsConfigurations.FiresCount, function(i, firesCountGraphicsConfig) {
          Utils.getSocket().emit(
            'graphicsFiresCountRequest',
            {
              dateFrom: dateFrom,
              dateTo: dateTo,
              key: firesCountGraphicsConfig.Key,
              title: firesCountGraphicsConfig.Title,
              satellite: satellite,
              extent: extent,
              country: Filter.getCountry(),
              state: Filter.getState()
            }
          );
        });
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
      if(memberFiresCountGraphics[firesCount.key] === undefined) {
        var htmlElements = "<div class=\"box box-default graphic-item\"><div class=\"box-header with-border\">" +
            "<h3 class=\"box-title\">" + firesCount.title + "</h3><div class=\"box-tools pull-right\">" +
            "<button type=\"button\" class=\"btn btn-box-tool\" data-widget=\"collapse\"><i class=\"fa fa-minus\"></i></button></div></div>" +
            "<div class=\"box-body\" style=\"display: block;\"><div class=\"chart\">" +
            "<canvas id=\"fires-count-by-" + firesCount.key + "-graphic\" style=\"height: 300px;\"></canvas>" +
            "<div id=\"fires-count-by-" + firesCount.key + "-graphic-message-container\" class=\"text-center\"></div></div></div></div>";

        $("#graphics-container").append(htmlElements);
        memberFiresCountGraphics[firesCount.key] = null;
      }

      if(firesCount.firesCount.rowCount > 0) {
        var labels = [];
        var values = [];

        $.each(firesCount.firesCount.rows, function(i, firesCountItem) {
          labels.push(firesCountItem.key);
          values.push(firesCountItem.count);
        });

        var firesCountGraphicData = {
          labels : labels,
          datasets : [
            {
              fillColor : "rgba(151,187,205,0.5)",
              strokeColor : "rgba(151,187,205,0.8)",
              highlightFill : "rgba(151,187,205,0.75)",
              highlightStroke : "rgba(151,187,205,1)",
              data : values
            }
          ]
        };

        if(memberFiresCountGraphics[firesCount.key] !== undefined && memberFiresCountGraphics[firesCount.key] !== null)
          memberFiresCountGraphics[firesCount.key].destroy();

        $("#fires-count-by-" + firesCount.key + "-graphic-message-container").hide();
        $("#fires-count-by-" + firesCount.key + "-graphic").show();
        var htmlElement = $("#fires-count-by-" + firesCount.key + "-graphic").get(0).getContext("2d");
        memberFiresCountGraphics[firesCount.key] = new Chart(htmlElement).Bar(firesCountGraphicData, { responsive : true, maintainAspectRatio: false });
      } else {
        $("#fires-count-by-" + firesCount.key + "-graphic").hide();
        $("#fires-count-by-" + firesCount.key + "-graphic-message-container").show();
        $("#fires-count-by-" + firesCount.key + "-graphic-message-container").html("Não existem dados a serem exibidos!");
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
        updateGraphics();
      });
    };

    return {
      setTimeSeriesTool: setTimeSeriesTool,
      updateGraphics: updateGraphics,
      loadFiresCountGraphic: loadFiresCountGraphic,
      init: init
    };
  }
);
