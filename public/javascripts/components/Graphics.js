"use strict";

/**
 * Graphics class of the BDQueimadas.
 * @class Graphics
 * @variation 2
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} firesCountBySatelliteGraphic - Graphic of fires count by satellite.
 */
BDQueimadas.components.Graphics = (function() {

  // Graphic of fires count by satellite
  var firesCountBySatelliteGraphic = null;

  /**
   * Updates all the graphics.
   *
   * @private
   * @function updateGraphics
   * @memberof Graphics(2)
   * @inner
   */
  var updateGraphics = function() {
    updateFiresCountBySatelliteGraphic();
  };

  /**
   * Updates the graphic of fires count by satellite.
   *
   * @private
   * @function updateFiresCountBySatelliteGraphic
   * @memberof Graphics(2)
   * @inner
   */
  var updateFiresCountBySatelliteGraphic = function() {
    var dateFrom = BDQueimadas.components.Filter.getFormattedDateFrom('YYYYMMDD');
    var dateTo = BDQueimadas.components.Filter.getFormattedDateTo('YYYYMMDD');
    var satellite = BDQueimadas.components.Filter.getSatellite() !== "all" ? BDQueimadas.components.Filter.getSatellite() : '';
    var extent = TerraMA2WebComponents.webcomponents.MapDisplay.getCurrentExtent();

    BDQueimadas.obj.getSocket().emit('graphicsFiresCountBySatelliteRequest', { dateFrom: dateFrom, dateTo: dateTo, satellite: satellite, extent: extent });
  };

  /**
   * Loads the graphic of fires count by satellite.
   * @param {json} firesCountBySatellite - Data to be used in the graphic
   *
   * @private
   * @function loadFiresCountBySatelliteGraphic
   * @memberof Graphics(2)
   * @inner
   */
  var loadFiresCountBySatelliteGraphic = function(firesCountBySatellite) {
    var labels = [];
    var values = [];

    $.each(firesCountBySatellite.firesCountBySatellite.rows, function(i, countBySatellite) {
      labels.push(countBySatellite.satelite);
      values.push(countBySatellite.count);
    });

    var firesCountBySatelliteGraphicData = {
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

    if(firesCountBySatelliteGraphic !== null) firesCountBySatelliteGraphic.destroy();

    var htmlElement = $("#fires-count-by-satellite-graphic").get(0).getContext("2d");
    firesCountBySatelliteGraphic = new Chart(htmlElement).Bar(firesCountBySatelliteGraphicData, { responsive : true, maintainAspectRatio: false });
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
    BDQueimadas.obj.getSocket().on('graphicsFiresCountBySatelliteResponse', function(result) {
      loadFiresCountBySatelliteGraphic(result);
    });
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
      loadSocketsListeners();
      updateGraphics();
    });
  };

  return {
    updateGraphics: updateGraphics,
    init: init
  };
})();
