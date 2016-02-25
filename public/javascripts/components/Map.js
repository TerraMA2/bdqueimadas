"use strict";

BDQueimadas.components.Map = (function() {

  var loadEvents = function() {
    $(document).ready(function() {
      TerraMA2WebComponents.webcomponents.MapDisplay.setDragBoxEnd(function() {
        var dragboxExtent = TerraMA2WebComponents.webcomponents.MapDisplay.getDragBoxExtent();
        TerraMA2WebComponents.webcomponents.MapDisplay.zoomToExtent(dragboxExtent);
        BDQueimadas.components.AttributesTable.updateAttributesTable();
      });

      $('#dragbox').on('click', function() {
        if($(this).hasClass('active')) {
          TerraMA2WebComponents.webcomponents.MapDisplay.removeDragBox();
          $(this).removeClass('active');
          $('#terrama2-map').removeClass('cursor-crosshair');
          $('#terrama2-map').addClass('cursor-move');
        } else {
          TerraMA2WebComponents.webcomponents.MapDisplay.addDragBox();
          $(this).addClass('active');
          $('#terrama2-map').addClass('cursor-crosshair');
          $('#terrama2-map').removeClass('cursor-move');
        }
      });

      $('#initialExtent').on('click', function() {
        TerraMA2WebComponents.webcomponents.MapDisplay.zoomToInitialExtent();
        BDQueimadas.components.AttributesTable.updateAttributesTable();
      });
    });
  };

  var init = function() {
    loadEvents();
  };

  return {
    init: init
  };
})();
