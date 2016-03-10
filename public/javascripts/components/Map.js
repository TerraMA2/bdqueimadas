"use strict";

BDQueimadas.components.Map = (function() {

  var loadEvents = function() {
    $(document).ready(function() {
      TerraMA2WebComponents.webcomponents.MapDisplay.setZoomDragBoxEndEvent(function() {
        var dragBoxExtent = TerraMA2WebComponents.webcomponents.MapDisplay.getZoomDragBoxExtent();
        TerraMA2WebComponents.webcomponents.MapDisplay.zoomToExtent(dragBoxExtent);
        BDQueimadas.components.AttributesTable.updateAttributesTable();
      });

      $('#dragbox').on('click', function() {
        resetMapMouseTools();
        activeDragboxTool();
      });

      $('#moveMap').on('click', function() {
        resetMapMouseTools();
        activeMoveMapTool();
      });

      $('#initialExtent').on('click', function() {
        resetMapMouseTools();
        initialExtent();
        activeMoveMapTool();
      });
    });
  };

  var resetMapMouseTools = function() {
    TerraMA2WebComponents.webcomponents.MapDisplay.removeZoomDragBox();
    $('.mouse-function-btn > i').removeClass('active');
    $('#terrama2-map').removeClass('cursor-crosshair');
    $('#terrama2-map').removeClass('cursor-move');
  };

  var activeMoveMapTool = function() {
    $('#moveMap > i').addClass('active');
    $('#terrama2-map').addClass('cursor-move');
  };

  var initialExtent = function() {
    TerraMA2WebComponents.webcomponents.MapDisplay.zoomToInitialExtent();
    BDQueimadas.components.AttributesTable.updateAttributesTable();
  };

  var activeDragboxTool = function() {
    $('#dragbox > i').addClass('active');
    $('#terrama2-map').addClass('cursor-crosshair');
    TerraMA2WebComponents.webcomponents.MapDisplay.addZoomDragBox();
  };

  var init = function() {
    loadEvents();
  };

  return {
    init: init
  };
})();
