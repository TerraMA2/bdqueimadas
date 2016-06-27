"use strict";

/**
 * Map class of the BDQueimadas.
 * @class Map
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 */
define(
  ['components/Utils', 'TerraMA2WebComponents'],
  function(Utils, TerraMA2WebComponents) {

    // new

    var memberLayers = [];
    var memberNotAddedLayers = [];

    var getLayers = function() {
      return memberLayers;
    };

    var getNotAddedLayers = function() {
      return memberNotAddedLayers;
    };

    // new

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
          for(var j = configuration.LayerGroups[i].Layers.length - 1; j >= 0; j--) {
            configuration.LayerGroups[i].Layers[j]["LayerGroup"] = {
              "Id": configuration.LayerGroups[i].Id,
              "Name": configuration.LayerGroups[i].Name
            };

            if(configuration.LayerGroups[i].Layers[j].AddsInTheStart) {
              if(configuration.UseLayerGroupsInTheLayerExplorer === "true") {
                if(TerraMA2WebComponents.MapDisplay.addLayerGroup(configuration.LayerGroups[i].Id, configuration.LayerGroups[i].Name))
                  TerraMA2WebComponents.LayerExplorer.addLayersFromMap(configuration.LayerGroups[i].Id, 'terrama2-layerexplorer');

                addLayerToMap(configuration.LayerGroups[i].Layers[j], configuration.LayerGroups[i].Id, true);
              } else {
                addLayerToMap(configuration.LayerGroups[i].Layers[j], 'terrama2-layerexplorer', true);
              }
            } else {
              addNotAddedLayer(configuration.LayerGroups[i].Layers[j]);
            }
          }
        }
      }

      $(document).on('click', '.remove-layer', function() {
        removeLayerFromMap($(this).parent().data('layerid'));
      });
    };

    /**
     * Adds a given layer to the Map and to the LayerExplorer.
     * @param {object} layer - Object with the layer data
     * @param {string} parent - Parent id
     *
     * @function addLayerToMap
     * @memberof Map
     * @inner
     */
    var addLayerToMap = function(layer, parent, initialProcess) {
      memberLayers.push(layer);

      var layerName = Utils.processStringWithDatePattern(layer.Name);
      var layerTime = Utils.processStringWithDatePattern(layer.Time);

      if(TerraMA2WebComponents.MapDisplay.addTileWMSLayer(layer.Url, layer.ServerType, layer.Id, layerName, layer.Visible, layer.MinResolution, layer.MaxResolution, parent, layerTime, layer.Disabled))
        TerraMA2WebComponents.LayerExplorer.addLayersFromMap(layer.Id, parent);

      if(!initialProcess) {
        $.event.trigger({type: "applyFilter"});

        $.each(memberNotAddedLayers, function(i, notAddedLayer) {
          if(notAddedLayer.Id === layer.Id) {
            memberNotAddedLayers.splice(i, 1);
            return false;
          }
        });
      }

      $(".layer:not(:has(.remove-layer))").append("<i class=\"fa fa-fw fa-remove remove-layer\"></i>");
    };

    // new

    var removeLayerFromMap = function(layerId) {
      var layerToRemove = null;

      $.each(memberLayers, function(i, layer) {
        if(layerId === layer.Id) {
          layerToRemove = memberLayers.splice(i, 1);
          return false;
        }
      });

      if(layerToRemove !== null) {
        addNotAddedLayer(layerToRemove[0]);

        if(Utils.getConfigurations().mapConfigurations.UseLayerGroupsInTheLayerExplorer === "true") {
          TerraMA2WebComponents.LayerExplorer.removeLayer(layerToRemove[0].Id, layerToRemove[0].LayerGroup.Id);
        } else {
          TerraMA2WebComponents.LayerExplorer.removeLayer(layerToRemove[0].Id);
        }
      }
    };


    var addNotAddedLayer = function(layer) {
      memberNotAddedLayers.push(layer);
    };

    // new

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
      $('.mouse-function-btn').removeClass('active');
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
      $('#moveMap').addClass('active');
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
      Utils.getSocket().emit('spatialFilterRequest', { ids: Utils.getConfigurations().applicationConfigurations.InitialContinentToFilter, key: 'Continent', filterForm: false });
    };

    /**
     * Activates the Zoom DragBox.
     *
     * @function activateDragboxTool
     * @memberof Map
     * @inner
     */
    var activateDragboxTool = function() {
      $('#dragbox').addClass('active');
      $('#terrama2-map').addClass('cursor-crosshair');
      TerraMA2WebComponents.MapDisplay.addZoomDragBox();
    };

    /**
     * Activates the GetFeatureInfo tool.
     *
     * @function activateGetFeatureInfoTool
     * @memberof Map
     * @inner
     */
    var activateGetFeatureInfoTool = function() {
      $('#getAttributes').addClass('active');
      $('#terrama2-map').addClass('cursor-pointer');

      TerraMA2WebComponents.MapDisplay.setGetFeatureInfoUrlOnClick(Utils.getConfigurations().filterConfigurations.LayerToFilter.LayerId, function(url) {
        if(url !== null) Utils.getSocket().emit('proxyRequest', { url: url, requestId: 'GetFeatureInfoTool' });
      });
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
        activateMoveMapTool();
      });
    };

    return {
      getLayers: getLayers,
      getNotAddedLayers: getNotAddedLayers,
      addLayerToMap: addLayerToMap,
      resetMapMouseTools: resetMapMouseTools,
      initialExtent: initialExtent,
      activateDragboxTool: activateDragboxTool,
      activateGetFeatureInfoTool: activateGetFeatureInfoTool,
      activateMoveMapTool: activateMoveMapTool,
      setSubtitlesVisibility: setSubtitlesVisibility,
      updateZoomTop: updateZoomTop,
      init: init
    };
  }
);
