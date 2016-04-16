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
BDQueimadas.components.Graphics = (function() {

  // Graphics of fires count
  var memberFiresCountGraphics = {};

  // new

  var getTimeSeriesGraphic = function() {
    var url = BDQueimadas.obj.getConfigurations().graphicsConfigurations.TimeSeries.URL;

    $.getJSON(url, function(data) {
        if(data.result !== undefined) {
        var graphicData = {
          labels: data.result.timeline,
          datasets: [
            {
              label: "Data Series",
              fillColor: "rgba(220,220,220,0.2)",
              strokeColor: "rgba(220,220,220,1)",
              pointColor: "rgba(220,220,220,1)",
              pointStrokeColor: "#fff",
              pointHighlightFill: "#fff",
              pointHighlightStroke: "rgba(220,220,220,1)",
              data: [1,2,3,4,5,6,7,8,9,10,11,12]//data.result.attributes[0].values
            }
          ]
        };

        console.log(graphicData);

        $('#timeSeriesDialog').dialog({
          width: 800,
          height: 900,
          resizable: false,
          closeOnEscape: true,
          position: { my: 'top', at: 'top+15' }
        });
        $('.ui-dialog-titlebar-close').text('X');

        var htmlElement = $("#time-series").get(0).getContext("2d");
        var timeSeriesGraphic = new Chart(htmlElement).Line(graphicData, { responsive : true });


      } else {
        throw new Error("Time Series Server Error!");
      }
    });
  };

  // new

  /**
   * Updates all the graphics.
   *
   * @function updateGraphics
   * @memberof Graphics(2)
   * @inner
   */
  var updateGraphics = function() {
    if($("#graph-box").css('left') < '0px') {
      var dateFrom = BDQueimadas.components.Filter.getFormattedDateFrom('YYYYMMDD');
      var dateTo = BDQueimadas.components.Filter.getFormattedDateTo('YYYYMMDD');
      var satellite = BDQueimadas.components.Filter.getSatellite() !== "all" ? BDQueimadas.components.Filter.getSatellite() : '';
      var extent = TerraMA2WebComponents.webcomponents.MapDisplay.getCurrentExtent();

      $.each(BDQueimadas.obj.getConfigurations().graphicsConfigurations.FiresCount, function(i, firesCountGraphicsConfig) {
        BDQueimadas.obj.getSocket().emit('graphicsFiresCountRequest', { dateFrom: dateFrom, dateTo: dateTo, key: firesCountGraphicsConfig.Key, title: firesCountGraphicsConfig.Title, satellite: satellite, extent: extent });
      });
    }
  };

  /**
   * Loads a given graphic of fires count.
   * @param {json} firesCount - Data to be used in the graphic
   *
   * @private
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
   * Loads the sockets listeners.
   *
   * @private
   * @function loadSocketsListeners
   * @memberof Graphics(2)
   * @inner
   */
  var loadSocketsListeners = function() {
    BDQueimadas.obj.getSocket().on('graphicsFiresCountResponse', function(result) {
      loadFiresCountGraphic(result);
    });
  };

  // new

  var loadEvents = function() {
    $('#getTimeSeries').on('click', function() {
      setTimeSeriesTool();
    });
  };

  var setTimeSeriesTool = function() {
    if($('#getTimeSeries > i').hasClass('active')) {
      TerraMA2WebComponents.webcomponents.MapDisplay.unsetMapSingleClickEvent();
      BDQueimadas.components.Map.resetMapMouseTools();
    } else {
      BDQueimadas.components.Map.resetMapMouseTools();
      $('#getTimeSeries > i').addClass('active');
      $('#terrama2-map').addClass('cursor-crosshair');
      TerraMA2WebComponents.webcomponents.MapDisplay.setMapSingleClickEvent();
    }
  };

  // new

  /**
   * Initializes the necessary features.
   *
   * @function init
   * @memberof Graphics(2)
   * @inner
   */
  var init = function() {
    $(document).ready(function() {
      loadEvents();
      loadSocketsListeners();
      updateGraphics();
    });
  };

  return {
    updateGraphics: updateGraphics,
    getTimeSeriesGraphic: getTimeSeriesGraphic,
    init: init
  };
})();
