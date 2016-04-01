"use strict";

/**
 * Graphics class of the BDQueimadas.
 * @class Graphics
 * @variation 2
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 */
BDQueimadas.components.Graphics = (function() {

  /**
   * Loads the sockets listeners.
   * @param {json} firesCountBySatellite - Format
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

    var firesCountBySatelliteGraphic = {
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
    }

    var htmlElement = document.getElementById("fires-count-by-satellite-graphic").getContext("2d");
    window.firesCountBySatelliteGraphic = new Chart(htmlElement).Bar(firesCountBySatelliteGraphic, { responsive : true, maintainAspectRatio: false });
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
    loadSocketsListeners();
    BDQueimadas.obj.getSocket().emit('graphicsFiresCountBySatelliteRequest');
  };

  return {
    init: init
  };
})();
