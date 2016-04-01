"use strict";

/**
 * Graphics class of the BDQueimadas.
 * @class Graphics
 * @variation 2
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 */
BDQueimadas.components.Graphics = (function() {

  var interval = null;

  var loadGraphics = function() {
    var features = JSON.parse(BDQueimadas.obj.getFeatures());

    var groupedData = {};
    var groupedDataBioma = {};
    var states = [];
    var biomas = [];

    for(var i = 0; i < 1000; i++) {
      var itemUf = features.features[i].properties.Uf;
      var itemBioma = features.features[i].properties.Bioma;

      if(BDQueimadas.components.Utils.stringInArray(states, itemUf)) {
        groupedData[itemUf]++;
      } else {
        groupedData[itemUf] = 1;
        states.push(itemUf);
      }

      if(BDQueimadas.components.Utils.stringInArray(biomas, itemBioma)) {
        groupedDataBioma[itemBioma]++;
      } else {
        groupedDataBioma[itemBioma] = 1;
        biomas.push(itemBioma);
      }
    }

    groupedData = BDQueimadas.components.Utils.sortIntegerArray(groupedData);
    groupedDataBioma = BDQueimadas.components.Utils.sortIntegerArray(groupedDataBioma);

    var labels = [];
    var values = [];

    var labelsB = [];
    var valuesB = [];

    var groupedDataLength = groupedData.length;
    var groupedDataBiomaLength = groupedDataBioma.length;

    for(var i = 0; i < groupedDataLength; i++) {
      labels.push(groupedData[i].key);
      values.push(groupedData[i].val);
    }

    for(var i = 0; i < groupedDataBiomaLength; i++) {
      labelsB.push(groupedDataBioma[i].key);
      valuesB.push(groupedDataBioma[i].val);
    }

    var barChartData = {
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

    var pieData = [
      {
        value: valuesB[0], color:"#F7464A", highlight: "#FF5A5E", label: labelsB[0]
      }, {
        value: valuesB[1], color: "#46BFBD", highlight: "#5AD3D1", label: labelsB[1]
      }, {
        value: valuesB[2], color: "#FDB45C", highlight: "#FFC870", label: labelsB[2]
      }, {
        value: valuesB[3], color: "#949FB1", highlight: "#A8B3C5", label: labelsB[3]
      }, {
        value: valuesB[4], color: "#4D5360", highlight: "#616774", label: labelsB[4]
      }
    ];

    var ctxBar = document.getElementById("canvas").getContext("2d");
    var ctxPie = document.getElementById("chart-area").getContext("2d");

    window.myBar = new Chart(ctxBar).Bar(barChartData, { responsive : true, maintainAspectRatio: false });
    window.myPie = new Chart(ctxPie).Pie(pieData, { responsive : true, maintainAspectRatio: false });

    $("#graphic-left").on('click', function() {
      $("#graphic-left").addClass("terrama2-span-active");
      $("#graphic-right").removeClass("terrama2-span-active");

      $("#canvas").css("display", "");
      $("#chart-area").css("display", "none");
    });

    $("#graphic-right").on('click', function() {
      $("#graphic-left").removeClass("terrama2-span-active");

      $("#canvas").css("display", "none");
      $("#chart-area").css("display", "");
    });
  };

  var verifiesOutsideVars = function() {
    if(BDQueimadas.obj.getFeatures() !== null) {
      loadGraphics();
      clearInterval(interval);
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
    BDQueimadas.obj.getSocket().on('graphicsFiresCountBySatelliteResponse', function(result) {
      console.log(result);
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
    interval = window.setInterval(verifiesOutsideVars, 3000);
    loadSocketsListeners();
    BDQueimadas.obj.getSocket().emit('graphicsFiresCountBySatelliteRequest');
  };

  return {
    loadGraphics: loadGraphics,
    init: init
  };
})();
