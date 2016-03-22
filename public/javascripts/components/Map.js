"use strict";

/**
 * Map class of the BDQueimadas.
 * @module Map
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 */
BDQueimadas.components.Map = (function() {

  /**
   * Resets the map tools to its initial state.
   *
   * @private
   * @function resetMapMouseTools
   */
  var resetMapMouseTools = function() {
    TerraMA2WebComponents.webcomponents.MapDisplay.removeZoomDragBox();
    $('.mouse-function-btn > i').removeClass('active');
    $('#terrama2-map').removeClass('cursor-crosshair');
    $('#terrama2-map').removeClass('cursor-move');
  };

  /**
   * Activates the move map tool.
   *
   * @private
   * @function activateMoveMapTool
   */
  var activateMoveMapTool = function() {
    $('#moveMap > i').addClass('active');
    $('#terrama2-map').addClass('cursor-move');
  };

  /**
   * Sets the map to its initial extent.
   *
   * @private
   * @function initialExtent
   */
  var initialExtent = function() {
    TerraMA2WebComponents.webcomponents.MapDisplay.zoomToInitialExtent();
    BDQueimadas.components.AttributesTable.updateAttributesTable();
  };

  /**
   * Activates the Zoom DragBox.
   *
   * @private
   * @function activateDragboxTool
   */
  var activateDragboxTool = function() {
    $('#dragbox > i').addClass('active');
    $('#terrama2-map').addClass('cursor-crosshair');
    TerraMA2WebComponents.webcomponents.MapDisplay.addZoomDragBox();
  };

  /**
   * Adds the subtitles of a given layer to the map.
   * @param {string} layerId - Layer id
   *
   * @function addSubtitle
   */
  var addSubtitle = function(layerId) {
    var elem = "";

    $.each(BDQueimadas.obj.getMapConfig().Subtitle, function(i, mapSubtitleItem) {
      if(mapSubtitleItem.Layer === layerId)
        elem += "<li class=\"" + layerId.replace(':', '') + "\"><a><div style=\"" + mapSubtitleItem.Css + "\"></div><span>" + mapSubtitleItem.SubtitleText + "</span></a></li>";
    });

    $('#map-subtitle-items').append(elem);

    updateZoomTop(false);
  };

  /**
   * Removes the subtitles of a given layer from the map.
   * @param {string} layerId - Layer id
   *
   * @function removeSubtitle
   */
  var removeSubtitle = function(layerId) {
    $("#map-subtitle-items > li." + layerId.replace(':', '')).remove();

    updateZoomTop(false);
  };

  /**
   * Shows the subtitles of a given layer.
   * @param {string} layerId - Layer id
   *
   * @function showSubtitle
   */
  var showSubtitle = function(layerId) {
    if(!$("#map-subtitle-items > li." + layerId.replace(':', '')).is(":visible"))
      $("#map-subtitle-items > li." + layerId.replace(':', '')).show();

    updateZoomTop(false);
  };

  /**
   * Hides the subtitles of a given layer.
   * @param {string} layerId - Layer id
   *
   * @function hideSubtitle
   */
  var hideSubtitle = function(layerId) {
    if($("#map-subtitle-items > li." + layerId.replace(':', '')).is(":visible"))
      $("#map-subtitle-items > li." + layerId.replace(':', '')).hide();

    updateZoomTop(false);
  };

  /**
   * Updates the zoom element top.
   * @param {boolean} toggle - Flag that indicates if the subtitle toggle was triggered
   *
   * @private
   * @function updateZoomTop
   */
  var updateZoomTop = function(toggle) {
    if($('.map-subtitle-toggle').parent().parent().parent().hasClass('collapsed-box') || !toggle)
      $('#terrama2-map .ol-zoom').animate({ 'top': '221px' }, { duration: 500, queue: false });
    else
      $('#terrama2-map .ol-zoom').animate({ 'top': '70px' }, { duration: 500, queue: false });
  };

  /**
   * Loads the DOM events.
   *
   * @private
   * @function loadEvents
   */
  var loadEvents = function() {
    $(document).ready(function() {
      TerraMA2WebComponents.webcomponents.MapDisplay.setZoomDragBoxEndEvent(function() {
        var dragBoxExtent = TerraMA2WebComponents.webcomponents.MapDisplay.getZoomDragBoxExtent();
        TerraMA2WebComponents.webcomponents.MapDisplay.zoomToExtent(dragBoxExtent);
        BDQueimadas.components.AttributesTable.updateAttributesTable();
      });

      $('#dragbox').on('click', function() {
        resetMapMouseTools();
        activateDragboxTool();
      });

      $('#moveMap').on('click', function() {
        resetMapMouseTools();
        activateMoveMapTool();
      });

      $('#initialExtent').on('click', function() {
        resetMapMouseTools();
        initialExtent();
        activateMoveMapTool();
        BDQueimadas.components.Filter.resetDropdowns();
      });

      $('.map-subtitle-toggle').on('click', function() {
        updateZoomTop(true);
      });
    });
  };

  /**
   * Initializes the necessary features.
   *
   * @function init
   */
  var init = function() {
    loadEvents();
  };

  return {
    addSubtitle: addSubtitle,
    removeSubtitle: removeSubtitle,
    showSubtitle: showSubtitle,
    hideSubtitle: hideSubtitle,
    init: init
  };
})();
