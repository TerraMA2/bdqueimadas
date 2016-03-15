"use strict";

BDQueimadas.components.MapSubtitle = (function() {

  var addSubtitle = function(layerName) {
    var elem = "";

    $.each(BDQueimadas.obj.getMapSubtitleConfig().MapSubtitle, function(i, mapSubtitleItem) {
      if(mapSubtitleItem.LayerName === layerName)
        elem += "<li class=\"" + layerName.replace(':', '') + "\"><a><div style=\"" + mapSubtitleItem.Css + "\"></div><span>" + mapSubtitleItem.SubtitleText + "</span></a></li>";
    });

    $('#map-subtitle-items').append(elem);
  };

  var removeSubtitle = function(layerName) {
    $("#map-subtitle-items > li." + layerName.replace(':', '')).remove();
  };

  var init = function() {};

  return {
    init: init,
    addSubtitle: addSubtitle,
    removeSubtitle: removeSubtitle
  };
})();
