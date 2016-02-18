BDQueimadas.components.Map = (function() {

  var init = function() {
    $(document).ready(function() {
      TerraMA2WebComponents.webcomponents.MapDisplay.setDragBoxEnd(function() {
        var extent = TerraMA2WebComponents.webcomponents.MapDisplay.gerDragBoxExtent();
        TerraMA2WebComponents.webcomponents.MapDisplay.zoomToExtent(extent);
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
      })
    });
  };

  return {
    init: init
  };
})();
