"use strict";

/**
 * Map class of the BDQueimadas.
 * @class Map
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 */
define(
  ['components/Utils', 'components/Filter', 'TerraMA2WebComponents'],
  function(Utils, Filter, TerraMA2WebComponents) {

    /**
     * Adds the layers from the map configuration file to the map.
     *
     * @private
     * @function addLayersToMap
     * @memberof Map
     * @inner
     */
    var addLayersToMap = function() {
      var configuration = Utils.getConfigurations().mapConfigurations;

      if(configuration.LayerGroups.length > 0) {
        for(var i = configuration.LayerGroups.length - 1; i >= 0; i--) {
          if(TerraMA2WebComponents.MapDisplay.addLayerGroup(configuration.LayerGroups[i].Id, configuration.LayerGroups[i].Name))
            TerraMA2WebComponents.LayerExplorer.addLayersFromMap(configuration.LayerGroups[i].Id, 'terrama2-layerexplorer');

          for(var j = configuration.LayerGroups[i].Layers.length - 1; j >= 0; j--) {
            var layerName = Utils.processStringWithDatePattern(configuration.LayerGroups[i].Layers[j].Name);
            var layerTime = Utils.processStringWithDatePattern(configuration.LayerGroups[i].Layers[j].Time);

            if(TerraMA2WebComponents.MapDisplay.addTileWMSLayer(configuration.LayerGroups[i].Layers[j].Url, configuration.LayerGroups[i].Layers[j].ServerType, configuration.LayerGroups[i].Layers[j].Id, layerName, configuration.LayerGroups[i].Layers[j].Visible, configuration.LayerGroups[i].Layers[j].MinResolution, configuration.LayerGroups[i].Layers[j].MaxResolution, configuration.LayerGroups[i].Id, layerTime))
              TerraMA2WebComponents.LayerExplorer.addLayersFromMap(configuration.LayerGroups[i].Layers[j].Id, configuration.LayerGroups[i].Id);

            if(configuration.LayerGroups[i].Layers[j].Id === Utils.getConfigurations().filterConfigurations.LayerToFilter.LayerId) {
              var initialDate = Utils.processStringWithDatePattern(Utils.getConfigurations().filterConfigurations.LayerToFilter.InitialDate);
              var finalDate = Utils.processStringWithDatePattern(Utils.getConfigurations().filterConfigurations.LayerToFilter.FinalDate);
              var filter = Utils.getConfigurations().filterConfigurations.LayerToFilter.DateFieldName + ">=" + initialDate + " and " + Utils.getConfigurations().filterConfigurations.LayerToFilter.DateFieldName + "<=" + finalDate + " and " + Utils.getConfigurations().filterConfigurations.LayerToFilter.SatelliteFieldName + "='AQUA_M-T'";

              TerraMA2WebComponents.MapDisplay.applyCQLFilter(filter, configuration.LayerGroups[i].Layers[j].Id);

              Filter.updateDates(initialDate, finalDate, Utils.getConfigurations().filterConfigurations.LayerToFilter.DateFormat);
            } else if(Utils.stringInArray(Utils.getConfigurations().filterConfigurations.CurrentSituationLayers.Layers, configuration.LayerGroups[i].Layers[j].Id)) {
              var initialDate = Utils.processStringWithDatePattern(Utils.getConfigurations().filterConfigurations.CurrentSituationLayers.InitialDate);
              var finalDate = Utils.processStringWithDatePattern(Utils.getConfigurations().filterConfigurations.CurrentSituationLayers.FinalDate);

              Filter.applyCurrentSituationFilter(initialDate, finalDate, $('#countries').val(), 'AQUA_M-T', configuration.LayerGroups[i].Layers[j].Id);
            }
          }
        }
      } else if(configuration.Layers.length > 0) {
        for(var j = configuration.Layers.length - 1; j >= 0; j--) {
          var layerName = Utils.processStringWithDatePattern(configuration.Layers[j].Name);
          var layerTime = Utils.processStringWithDatePattern(configuration.Layers[j].Time);

          if(TerraMA2WebComponents.MapDisplay.addTileWMSLayer(configuration.Layers[j].Url, configuration.Layers[j].ServerType, configuration.Layers[j].Id, layerName, configuration.Layers[j].Visible, configuration.Layers[j].MinResolution, configuration.Layers[j].MaxResolution, 'terrama2-layerexplorer', layerTime))
            TerraMA2WebComponents.LayerExplorer.addLayersFromMap(configuration.Layers[j].Id, 'terrama2-layerexplorer');

          if(configuration.Layers[j].Id === Utils.getConfigurations().filterConfigurations.LayerToFilter.LayerId) {
            var initialDate = Utils.processStringWithDatePattern(Utils.getConfigurations().filterConfigurations.LayerToFilter.InitialDate);
            var finalDate = Utils.processStringWithDatePattern(Utils.getConfigurations().filterConfigurations.LayerToFilter.FinalDate);
            var filter = Utils.getConfigurations().filterConfigurations.LayerToFilter.DateFieldName + ">=" + initialDate + " and " + Utils.getConfigurations().filterConfigurations.LayerToFilter.DateFieldName + "<=" + finalDate + " and " + Utils.getConfigurations().filterConfigurations.LayerToFilter.SatelliteFieldName + "='AQUA_M-T'";

            TerraMA2WebComponents.MapDisplay.applyCQLFilter(filter, configuration.Layers[j].Id);

            Filter.updateDates(initialDate, finalDate, Utils.getConfigurations().filterConfigurations.LayerToFilter.DateFormat);
          } else if(Utils.stringInArray(Utils.getConfigurations().filterConfigurations.CurrentSituationLayers.Layers, configuration.Layers[j].Id)) {
            var initialDate = Utils.processStringWithDatePattern(Utils.getConfigurations().filterConfigurations.CurrentSituationLayers.InitialDate);
            var finalDate = Utils.processStringWithDatePattern(Utils.getConfigurations().filterConfigurations.CurrentSituationLayers.FinalDate);

            Filter.applyCurrentSituationFilter(initialDate, finalDate, $('#countries').val(), 'AQUA_M-T', configuration.Layers[j].Id);
          }
        }
      }
    };

    /**
     * Resets the map tools to its initial state.
     *
     * @function resetMapMouseTools
     * @memberof Map
     * @inner
     */
    var resetMapMouseTools = function() {
      TerraMA2WebComponents.MapDisplay.unsetMapSingleClickEvent();
      TerraMA2WebComponents.MapDisplay.removeZoomDragBox();
      $('.mouse-function-btn > i').removeClass('active');
      $('#terrama2-map').removeClass('cursor-crosshair');
      $('#terrama2-map').removeClass('cursor-move');
      $('#terrama2-map').removeClass('cursor-pointer');
    };

    /**
     * Activates the move map tool.
     *
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
     * @function initialExtent
     * @memberof Map
     * @inner
     */
    var initialExtent = function() {
      Utils.getSocket().emit('spatialFilterRequest', { id: Utils.getConfigurations().applicationConfigurations.InitialContinentToFilter, text: Utils.getConfigurations().applicationConfigurations.InitialContinentToFilter, key: 'Continent' });
    };

    /**
     * Activates the Zoom DragBox.
     *
     * @function activateDragboxTool
     * @memberof Map
     * @inner
     */
    var activateDragboxTool = function() {
      $('#dragbox > i').addClass('active');
      $('#terrama2-map').addClass('cursor-crosshair');
      TerraMA2WebComponents.MapDisplay.addZoomDragBox();
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
      var configuration = Utils.getConfigurations().mapConfigurations;

      $.each(configuration.Subtitles, function(i, mapSubtitleItem) {
        elem += "<li class=\"" + mapSubtitleItem.LayerId.replace(':', '') + "\"><a><span style=\"font-weight: bold;\">" + mapSubtitleItem.LayerName + "</span></a></li>";

        $.each(mapSubtitleItem.Subtitles, function(j, layerSubtitleItem) {
          var css = "";

          if(layerSubtitleItem.FillColor !== null)
            css += "background-color: " + layerSubtitleItem.FillColor + ";";

          if(layerSubtitleItem.BorderColor !== null)
            css += "border: solid 2px " + layerSubtitleItem.BorderColor + ";";

          if(layerSubtitleItem.Image !== null)
            css += "background: url(" + layerSubtitleItem.Image + ");background-size: 15px;background-position: center;background-repeat: no-repeat;";

          elem += "<li class=\"" + mapSubtitleItem.LayerId.replace(':', '') + "\"><a><div style=\"" + css + "\"></div><span>" + layerSubtitleItem.SubtitleText + "</span></a></li>";
        });
      });

      $('#map-subtitle-items').append(elem);

      setSubtitlesVisibility();
      updateZoomTop(false);
    };

    /**
     * Sets the visibility of the subtitles, accordingly with its respective layers. If a layer id is passed, the function is executed only for the subtitles of this layer.
     * @param {string} [layerId] - Layer id
     *
     * @function setSubtitlesVisibility
     * @memberof Map
     * @inner
     */
    var setSubtitlesVisibility = function(layerId) {
      var configuration = Utils.getConfigurations().mapConfigurations;

      $.each(configuration.Subtitles, function(i, mapSubtitleItem) {
        if(layerId === undefined || layerId === mapSubtitleItem.LayerId) {
          if(TerraMA2WebComponents.MapDisplay.isCurrentResolutionValidForLayer(mapSubtitleItem.LayerId) && TerraMA2WebComponents.MapDisplay.isLayerVisible(mapSubtitleItem.LayerId)) {
            showSubtitle(mapSubtitleItem.LayerId);
          } else {
            hideSubtitle(mapSubtitleItem.LayerId);
          }
        }
      });
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
     * Initializes the necessary features.
     *
     * @function init
     * @memberof Map
     * @inner
     */
    var init = function() {
      $(document).ready(function() {
        addLayersToMap();
        addSubtitles();
      });
    };

    return {
      resetMapMouseTools: resetMapMouseTools,
      initialExtent: initialExtent,
      activateDragboxTool: activateDragboxTool,
      activateMoveMapTool: activateMoveMapTool,
      setSubtitlesVisibility: setSubtitlesVisibility,
      updateZoomTop: updateZoomTop,
      init: init
    };
  }
);
