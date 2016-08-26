"use strict";

/**
 * Map class of the BDQueimadas.
 * @class Map
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {array} memberLayers - Layers currently present in the map.
 * @property {array} memberNotAddedLayers - Layers not present in the map.
 * @property {array} memberVisibleLayers - Currently visible layers.
 */
define(
  ['components/Utils', 'TerraMA2WebComponents'],
  function(Utils, TerraMA2WebComponents) {

    // Layers currently present in the map
    var memberLayers = [];
    // Layers not present in the map
    var memberNotAddedLayers = [];
    // Currently visible layers
    var memberVisibleLayers = [];

    /**
     * Returns the array of layers currently present in the map.
     * @returns {array} memberLayers - Layers currently present in the map
     *
     * @function getLayers
     * @memberof Map
     * @inner
     */
    var getLayers = function() {
      return memberLayers;
    };

    /**
     * Returns the array of layers not present in the map.
     * @returns {array} memberNotAddedLayers - Layers not present in the map
     *
     * @function getNotAddedLayers
     * @memberof Map
     * @inner
     */
    var getNotAddedLayers = function() {
      return memberNotAddedLayers;
    };

    /**
     * Adds a layer to the visible layers array.
     * @param {string} layerId - Layer id
     * @param {string} layerName - Layer name
     * @param {string} parentId - Parent id
     * @param {string} parentName - Parent name
     * @param {string} elementId - Html element id
     *
     * @function addVisibleLayer
     * @memberof Map
     * @inner
     */
    var addVisibleLayer = function(layerId, layerName, parentId, parentName, elementId) {
      memberVisibleLayers.push({
        layerId: layerId,
        layerName: layerName,
        parentId: parentId,
        parentName: parentName,
        elementId: elementId
      });

      if($('#map-info-box').parent('.ui-dialog').css('display') !== undefined && $('#map-info-box').parent('.ui-dialog').css('display') !== 'none') {
        $.event.trigger({type: "updateMapInformationsBox"});
      }
    };

    /**
     * Removes a layer from the visible layers array.
     * @param {string} layerId - Layer id
     *
     * @function removeVisibleLayer
     * @memberof Map
     * @inner
     */
    var removeVisibleLayer = function(layerId) {
      for(var i = 0, count = memberVisibleLayers.length; i < count; i++) {
        if(memberVisibleLayers[i].layerId === layerId) {
          memberVisibleLayers.splice(i, 1);
          break;
        }
      }

      if($('#map-info-box').parent('.ui-dialog').css('display') !== undefined && $('#map-info-box').parent('.ui-dialog').css('display') !== 'none') {
        $.event.trigger({type: "updateMapInformationsBox"});
      }
    };

    /**
     * Returns the array of currently visible layers.
     * @returns {array} memberVisibleLayers - Currently visible layers
     *
     * @function getVisibleLayers
     * @memberof Map
     * @inner
     */
    var getVisibleLayers = function() {
      return memberVisibleLayers;
    };

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

      if(configuration.Layers.length > 0) {
        for(var i = configuration.Layers.length - 1; i >= 0; i--) {
          processLayer(configuration.Layers[i], 'terrama2-layerexplorer', 'Camadas Principais');
        }
      }

      $('.children:empty').parent().hide();
      $('#terrama2-layerexplorer').append('<div class="clear: both;"></div>');
    };

    /**
     * Recursive function that processes a given layer or layer group.
     * @param {object} layer - Object with the layer data
     * @param {string} parentId - Parent id
     * @param {string} parentName - Parent name
     *
     * @private
     * @function processLayer
     * @memberof Map
     * @inner
     */
    var processLayer = function(layer, parentId, parentName) {
      var configuration = Utils.getConfigurations().mapConfigurations;

      if(layer.LayerGroup) {
        if(configuration.UseLayerGroupsInTheLayerExplorer) {
          if(TerraMA2WebComponents.MapDisplay.addLayerGroup(layer.Id, layer.Name))
            TerraMA2WebComponents.LayerExplorer.addLayersFromMap(layer.Id, parentId, null, layer.Classes);
        }

        for(var j = layer.Layers.length - 1; j >= 0; j--) {
          if(configuration.UseLayerGroupsInTheLayerExplorer) {
            processLayer(layer.Layers[j], layer.Id, layer.Name);
          } else {
            processLayer(layer.Layers[j], parentId, parentName);
          }
        }
      } else {
        layer["LayerGroup"] = {
          "Id": parentId,
          "Name": parentName
        };

        if(layer.AddsInTheStart) addLayerToMap(layer, parentId, true);
        else addNotAddedLayer(layer);
      }
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

      if(layer.TerraMA2WebComponentsFunction !== null) {
        if(TerraMA2WebComponents.MapDisplay[layer.TerraMA2WebComponentsFunction](layer.Id, layerName, layer.Visible, parent, layer.AppendAtTheEnd))
          TerraMA2WebComponents.LayerExplorer.addLayersFromMap(layer.Id, parent, layer.AppendAtTheEnd, layer.Classes);
      } else {
        if(TerraMA2WebComponents.MapDisplay.addTileWMSLayer(layer.Url, layer.ServerType, layer.Id, layerName, layer.Visible, layer.MinResolution, layer.MaxResolution, parent, layerTime, layer.Disabled, layer.Buffer, layer.Version, layer.Format, layer.TileGrid))
          TerraMA2WebComponents.LayerExplorer.addLayersFromMap(layer.Id, parent, null, layer.Classes);
      }

      if(!initialProcess) {
        $.event.trigger({type: "applyFilter"});

        $.each(memberNotAddedLayers, function(i, notAddedLayer) {
          if(notAddedLayer.Id === layer.Id) {
            memberNotAddedLayers.splice(i, 1);
            return false;
          }
        });
      }

      if(Utils.getConfigurations().mapConfigurations.EnableAddAndRemoveLayers)
        $(".layer:not(:has(.remove-layer))").append("<i class=\"fa fa-fw fa-remove remove-layer\"></i>");

      if(layer.Visible) {
        var parents = $("#" + layer.Id.replace(':', '')).parents('.parent_li').find(' > .group-name > span'),
            parentsLength = parents.length,
            parentsString = "";

        if(parentsLength > 0) {
          for(var i = 0; i < parentsLength; i++) {
            parentsString += parents[i].innerText + " > ";
          }
        }

        addVisibleLayer(layer.Id, layerName, parent, parentsString, layer.Id.replace(':', ''));
      }
    };

    /**
     * Removes a layer with a given id from the Map.
     * @param {string} layerId - Layer id
     *
     * @function removeLayerFromMap
     * @memberof Map
     * @inner
     */
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

        if(Utils.getConfigurations().mapConfigurations.UseLayerGroupsInTheLayerExplorer) {
          TerraMA2WebComponents.LayerExplorer.removeLayer(layerToRemove[0].Id, layerToRemove[0].LayerGroup.Id);
        } else {
          TerraMA2WebComponents.LayerExplorer.removeLayer(layerToRemove[0].Id);
        }

        removeVisibleLayer(layerToRemove[0].Id);
      }
    };

    /**
     * Adds a given layer to the array of layers not present in the map.
     * @param {object} layer - Layer
     *
     * @private
     * @function addNotAddedLayer
     * @memberof Map
     * @inner
     */
    var addNotAddedLayer = function(layer) {
      memberNotAddedLayers.push(layer);
    };

    /**
     * Sets the visibility of the background layers when the user set a layer visible.
     * @param {string} selectedLayerId - Id of the selected layer
     *
     * @function setBackgroundsVisibility
     * @memberof Map
     * @inner
     */
    var setBackgroundsVisibility = function(selectedLayerId) {
      var layersLength = memberLayers.length,
          backgroundLayers = [],
          isThisABackgroundLayer = false;

      for(var i = 0; i < layersLength; i++) {
        if(memberLayers[i].Background) {
          if(memberLayers[i].Id === selectedLayerId) {
            isThisABackgroundLayer = true;
          } else {
            backgroundLayers.push(memberLayers[i].Id);
          }
        }
      }

      if(isThisABackgroundLayer) {
        var backgroundLayersLength = backgroundLayers.length;

        for(var i = 0; i < backgroundLayersLength; i++) {
          if($('#' + backgroundLayers[i].replace(':', '') + ' > input').is(":checked")) {
            TerraMA2WebComponents.MapDisplay.setLayerVisibilityById(backgroundLayers[i], false);
            $('#' + backgroundLayers[i].replace(':', '') + ' > input').attr('checked', false);
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

        var liStyle = mapSubtitleItem.LayerId === Utils.getConfigurations().filterConfigurations.LayerToFilter.LayerId ? "display: none;" : "";

        $.each(mapSubtitleItem.Subtitles, function(j, layerSubtitleItem) {
          var css = "";

          if(layerSubtitleItem.FillColor !== null)
            css += "background-color: " + layerSubtitleItem.FillColor + ";";

          if(layerSubtitleItem.BorderColor !== null)
            css += "border: solid 2px " + layerSubtitleItem.BorderColor + ";";

          if(layerSubtitleItem.Image !== null)
            css += "background: url(" + layerSubtitleItem.Image + ");background-size: 12px;background-position: center;background-repeat: no-repeat;";

          elem += "<li class=\"" + mapSubtitleItem.LayerId.replace(':', '') + " subtitle-item";

          if(mapSubtitleItem.LayerId === Utils.getConfigurations().filterConfigurations.LayerToFilter.LayerId)
            elem += " satellite-subtitle-item";

          elem += "\"";

          if(layerSubtitleItem.SubtitleId !== null)
            elem += " id=\"" + layerSubtitleItem.SubtitleId + "\"";

          elem += " style=\"" + liStyle + "\"><a><div style=\"" + css + "\"></div><span>" + layerSubtitleItem.SubtitleText + "</span></a></li>";
        });
      });

      $('#map-subtitle-items').append(elem);

      setSubtitlesVisibility();
      updateZoomTop(false);
    };

    /**
     * Calls the socket method that returns the list of satellites for the subtitles.
     * @param {array} satellites - Satellites filter
     * @param {array} biomes - Biomes filter
     * @param {array} countriesBdqNames - Countries filter
     * @param {array} statesBdqNames - States filter
     *
     * @function getSubtitlesSatellites
     * @memberof Map
     * @inner
     */
    var getSubtitlesSatellites = function(satellites, biomes, countriesBdqNames, statesBdqNames) {
      var dates = Utils.getFilterDates(true, 0);

      if(dates !== null) {
        var dateFrom = Utils.dateToString(Utils.stringToDate(dates[0], 'YYYY/MM/DD'), Utils.getConfigurations().firesDateFormat);
        var dateTo = Utils.dateToString(Utils.stringToDate(dates[1], 'YYYY/MM/DD'), Utils.getConfigurations().firesDateFormat);
        var satellites = Utils.stringInArray(satellites, "all") ? '' : satellites.toString();
        var biomes = Utils.stringInArray(biomes, "all") ? '' : biomes.toString();
        var extent = TerraMA2WebComponents.MapDisplay.getCurrentExtent();
        var countries = (Utils.stringInArray(countriesBdqNames, "") || countriesBdqNames.length === 0 ? '' : countriesBdqNames.toString());
        var states = (Utils.stringInArray(statesBdqNames, "") || statesBdqNames.length === 0 ? '' : statesBdqNames.toString());

        Utils.getSocket().emit(
          'getSatellitesRequest',
          {
            dateFrom: dateFrom,
            dateTo: dateTo,
            satellites: satellites,
            biomes: biomes,
            extent: extent,
            countries: countries,
            states: states
          }
        );
      }
    };

    /**
     * Updates the subtitles.
     * @param {array} satellites - Satellites list
     *
     * @function updateSubtitles
     * @memberof Map
     * @inner
     */
    var updateSubtitles = function(satellites) {
      $(".satellite-subtitle-item").hide();

      $.each(satellites, function(i, satellite) {
        $("#" + satellite.satelite).show();
      });
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
      if(!$("#map-subtitle-items > li." + layerId.replace(':', '') + ".subtitle-item").is(":visible") && ($("#map-subtitle-items > li." + layerId.replace(':', '') + ".subtitle-item").attr("id") === "" || $("#map-subtitle-items > li." + layerId.replace(':', '') + ".subtitle-item").attr("id") === undefined))
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
      if($("#map-subtitle-items > li." + layerId.replace(':', '') + ".subtitle-item").attr("id") === "" || $("#map-subtitle-items > li." + layerId.replace(':', '') + ".subtitle-item").attr("id") === undefined)
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
      if(toggle) {
        setTimeout(function() {
          $('#terrama2-map .ol-zoom').animate({ 'top': ($('#map-subtitle').height() + 7) + 'px' }, { duration: 300, queue: false });
          $('#map-tools').animate({ 'top': ($('#map-subtitle').height() + 65) + 'px' }, { duration: 300, queue: false });
        }, 500);
      } else {
        $('#terrama2-map .ol-zoom').css('top', ($('#map-subtitle').height() + 7) + 'px');
        $('#map-tools').css('top', ($('#map-subtitle').height() + 65) + 'px');
      }
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
        TerraMA2WebComponents.MapDisplay.disableDoubleClickZoom();
        TerraMA2WebComponents.MapDisplay.addMousePosition();
        TerraMA2WebComponents.MapDisplay.addScale();

        addLayersToMap();
        addSubtitles();
        activateMoveMapTool();
      });
    };

    return {
      getLayers: getLayers,
      getNotAddedLayers: getNotAddedLayers,
      addVisibleLayer: addVisibleLayer,
      removeVisibleLayer: removeVisibleLayer,
      getVisibleLayers: getVisibleLayers,
      addLayerToMap: addLayerToMap,
      removeLayerFromMap: removeLayerFromMap,
      setBackgroundsVisibility: setBackgroundsVisibility,
      resetMapMouseTools: resetMapMouseTools,
      initialExtent: initialExtent,
      activateDragboxTool: activateDragboxTool,
      activateGetFeatureInfoTool: activateGetFeatureInfoTool,
      getSubtitlesSatellites: getSubtitlesSatellites,
      updateSubtitles: updateSubtitles,
      activateMoveMapTool: activateMoveMapTool,
      setSubtitlesVisibility: setSubtitlesVisibility,
      updateZoomTop: updateZoomTop,
      init: init
    };
  }
);
