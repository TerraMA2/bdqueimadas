"use strict";

/**
 * Map class of the BDQueimadas.
 * @class Map
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 */
BDQueimadas.components.Map = (function() {

  /**
   * Adds the layers from the map configuration file to the map.
   *
   * @private
   * @function addLayersToMap
   * @memberof Map
   * @inner
   */
  var addLayersToMap = function() {
    var configuration = BDQueimadas.obj.getMapConfig();

    $.each(configuration.LayerGroups, function(i, layerGroup) {
      TerraMA2WebComponents.webcomponents.MapDisplay.addLayerGroup(layerGroup.Id, layerGroup.Name);

      $.each(layerGroup.Layers, function(j, layer) {
        var layerName = BDQueimadas.components.Utils.processStringWithDatePattern(layer.Name);
        var layerTime = BDQueimadas.components.Utils.processStringWithDatePattern(layer.Time);

        TerraMA2WebComponents.webcomponents.MapDisplay.addTileWMSLayer(layer.Url, layer.ServerType, layer.Id, layerName, layer.Visible, layer.MinResolution, layer.MaxResolution, layerGroup.Id, layerTime);

        if(layer.Id === BDQueimadas.obj.getFilterConfig().LayerToFilter.LayerId) {

          var initialDate = BDQueimadas.components.Utils.processStringWithDatePattern(BDQueimadas.obj.getFilterConfig().LayerToFilter.InitialDate);
          var finalDate = BDQueimadas.components.Utils.processStringWithDatePattern(BDQueimadas.obj.getFilterConfig().LayerToFilter.FinalDate);
          var filter = BDQueimadas.obj.getFilterConfig().LayerToFilter.DateFieldName + ">=" + initialDate + " and " + BDQueimadas.obj.getFilterConfig().LayerToFilter.DateFieldName + "<=" + finalDate;

          TerraMA2WebComponents.webcomponents.MapDisplay.applyCQLFilter(filter, layer.Id);

          BDQueimadas.components.Filter.updateDates(initialDate, finalDate, BDQueimadas.obj.getFilterConfig().LayerToFilter.DateFormat);
          BDQueimadas.components.AttributesTable.updateAttributesTable();
        }
      });
    });
  };

  /**
   * Resets the map tools to its initial state.
   *
   * @private
   * @function resetMapMouseTools
   * @memberof Map
   * @inner
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
   * @memberof Map
   * @inner
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
   * @memberof Map
   * @inner
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
   * @memberof Map
   * @inner
   */
  var activateDragboxTool = function() {
    $('#dragbox > i').addClass('active');
    $('#terrama2-map').addClass('cursor-crosshair');
    TerraMA2WebComponents.webcomponents.MapDisplay.addZoomDragBox();
  };

  /**
   * Adds the layers subtitles from the map configuration file to the map.
   *
   * @private
   * @function addSubtitles
   * @memberof Map
   * @inner
   */
  var addSubtitles = function() {
    var elem = "";
    var configuration = BDQueimadas.obj.getMapConfig();

    $.each(configuration.Subtitles, function(i, mapSubtitleItem) {
      var css = "";

      if(mapSubtitleItem.FillColor !== null)
        css += "background-color: " + mapSubtitleItem.FillColor + ";";

      if(mapSubtitleItem.BorderColor !== null)
        css += "border: solid 2px " + mapSubtitleItem.BorderColor + ";";

      if(mapSubtitleItem.Image !== null)
        css += "background: url(" + mapSubtitleItem.Image + ");background-size: 15px;background-position: center;background-repeat: no-repeat;";

      elem += "<li class=\"" + mapSubtitleItem.LayerId.replace(':', '') + "\"><a><div style=\"" + css + "\"></div><span>" + mapSubtitleItem.SubtitleText + "</span></a></li>";
    });

    $('#map-subtitle-items').append(elem);

    setSubtitlesVisibility();
    updateZoomTop(false);
  };

  /**
   * Sets the visibility of the subtitles, accordingly with its respective layers. If a layer id is passed, the function is executed only for the subtitles of this layer.
   * @param {string} [layerId] - Layer id
   *
   * @private
   * @function setSubtitlesVisibility
   * @memberof Map
   * @inner
   */
  var setSubtitlesVisibility = function(layerId) {
    var interval = window.setInterval(function() {
      if(TerraMA2WebComponents.obj.isComponentsLoaded()) {
        var configuration = BDQueimadas.obj.getMapConfig();

        $.each(configuration.Subtitles, function(i, mapSubtitleItem) {
          if(layerId === undefined || layerId === mapSubtitleItem.LayerId) {
            if(TerraMA2WebComponents.webcomponents.MapDisplay.isCurrentResolutionValidForLayer(mapSubtitleItem.LayerId) && TerraMA2WebComponents.webcomponents.MapDisplay.isLayerVisible(mapSubtitleItem.LayerId)) {
              showSubtitle(mapSubtitleItem.LayerId);
            } else {
              hideSubtitle(mapSubtitleItem.LayerId);
            }
          }
        });

        clearInterval(interval);
      }
    }, 10);
  };

  /**
   * Shows the subtitles of a given layer.
   * @param {string} layerId - Layer id
   *
   * @private
   * @function showSubtitle
   * @memberof Map
   * @inner
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
   * @private
   * @function hideSubtitle
   * @memberof Map
   * @inner
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
   * @memberof Map
   * @inner
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
   * @memberof Map
   * @inner
   */
  var loadEvents = function() {
    $(document).ready(function() {
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

      var interval = window.setInterval(function() {
        if(TerraMA2WebComponents.obj.isComponentsLoaded()) {
          TerraMA2WebComponents.webcomponents.MapDisplay.setZoomDragBoxEndEvent(function(e) {
            var dragBoxExtent = TerraMA2WebComponents.webcomponents.MapDisplay.getZoomDragBoxExtent();
            TerraMA2WebComponents.webcomponents.MapDisplay.zoomToExtent(dragBoxExtent);
            BDQueimadas.components.AttributesTable.updateAttributesTable();
          });

          TerraMA2WebComponents.webcomponents.MapDisplay.setMapResolutionChangeEvent(function(e) {
            setSubtitlesVisibility();
          });

          TerraMA2WebComponents.webcomponents.MapDisplay.setMapDoubleClickEvent(function(e) {
            BDQueimadas.obj.getSocket().emit('extentByIntersectionRequest', {
              longitude: e.coordinate[0],
              latitude: e.coordinate[1],
              resolution: TerraMA2WebComponents.webcomponents.MapDisplay.getCurrentResolution()
            });
          });

          TerraMA2WebComponents.webcomponents.MapDisplay.setLayerVisibilityChangeEvent(function(e, layerId) {
            setSubtitlesVisibility(layerId);
          });

          clearInterval(interval);
        }
      }, 10);
    });
  };

  /**
   * Initializes the necessary features.
   *
   * @function init
   * @memberof Map
   * @inner
   */
  var init = function() {
    loadEvents();
    addLayersToMap();
    addSubtitles();
  };

  return {
    init: init
  };
})();
