"use strict";

/**
 * Graphics class of the BDQueimadas.
 * @class Graphics
 * @variation 2
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} firesCountBySatelliteGraphic - Graphic of fires count by satellite.
 * @property {object} firesCountByStateGraphic - Graphic of fires count by state.
 * @property {object} firesCountByBiomeGraphic - Graphic of fires count by biome.
 */
BDQueimadas.components.Graphics = (function() {

  // Graphic of fires count by satellite
  var firesCountBySatelliteGraphic = null;
  // Graphic of fires count by state
  var firesCountByStateGraphic = null;
  // Graphic of fires count by biome
  var firesCountByBiomeGraphic = null;

  /**
   * Updates all the graphics.
   *
   * @function updateGraphics
   * @memberof Graphics(2)
   * @inner
   */
  var updateGraphics = function() {
    var dateFrom = BDQueimadas.components.Filter.getFormattedDateFrom('YYYYMMDD');
    var dateTo = BDQueimadas.components.Filter.getFormattedDateTo('YYYYMMDD');
    var satellite = BDQueimadas.components.Filter.getSatellite() !== "all" ? BDQueimadas.components.Filter.getSatellite() : '';
    var extent = TerraMA2WebComponents.webcomponents.MapDisplay.getCurrentExtent();

    BDQueimadas.obj.getSocket().emit('graphicsFiresCountRequest', { dateFrom: dateFrom, dateTo: dateTo, key: "satelite", satellite: satellite, extent: extent });
    BDQueimadas.obj.getSocket().emit('graphicsFiresCountRequest', { dateFrom: dateFrom, dateTo: dateTo, key: "uf", satellite: satellite, extent: extent });
    BDQueimadas.obj.getSocket().emit('graphicsFiresCountRequest', { dateFrom: dateFrom, dateTo: dateTo, key: "bioma", satellite: satellite, extent: extent });
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

    $.each(firesCountBySatellite.firesCount.rows, function(i, countBySatellite) {
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
   * Loads the graphic of fires count by state.
   * @param {json} firesCountByState - Data to be used in the graphic
   *
   * @private
   * @function loadFiresCountByStateGraphic
   * @memberof Graphics(2)
   * @inner
   */
  var loadFiresCountByStateGraphic = function(firesCountByState) {
    var labels = [];
    var values = [];

    $.each(firesCountByState.firesCount.rows, function(i, countByState) {
      labels.push(countByState.uf);
      values.push(countByState.count);
    });

    var firesCountByStateGraphicData = {
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

    if(firesCountByStateGraphic !== null) firesCountByStateGraphic.destroy();

    var htmlElement = $("#fires-count-by-state-graphic").get(0).getContext("2d");
    firesCountByStateGraphic = new Chart(htmlElement).Bar(firesCountByStateGraphicData, { responsive : true, maintainAspectRatio: false });
  };

  /**
   * Loads the graphic of fires count by biome.
   * @param {json} firesCountByBiome - Data to be used in the graphic
   *
   * @private
   * @function loadFiresCountByBiomeGraphic
   * @memberof Graphics(2)
   * @inner
   */
  var loadFiresCountByBiomeGraphic = function(firesCountByBiome) {
    var labels = [];
    var values = [];

    $.each(firesCountByBiome.firesCount.rows, function(i, countByBiome) {
      labels.push(countByBiome.bioma);
      values.push(countByBiome.count);
    });

    var firesCountByBiomeGraphicData = {
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

    if(firesCountByBiomeGraphic !== null) firesCountByBiomeGraphic.destroy();

    var htmlElement = $("#fires-count-by-biome-graphic").get(0).getContext("2d");
    firesCountByBiomeGraphic = new Chart(htmlElement).Bar(firesCountByBiomeGraphicData, { responsive : true, maintainAspectRatio: false });
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
      switch(result.key) {
        case "satelite":
          loadFiresCountBySatelliteGraphic(result);
          break;
        case "uf":
          loadFiresCountByStateGraphic(result);
          break;
        case "bioma":
          loadFiresCountByBiomeGraphic(result);
          break;
        default:
          break;
      }
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
