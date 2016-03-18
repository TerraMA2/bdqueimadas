"use strict";

BDQueimadas.components.MapSubtitle = (function() {

  var addSubtitle = function(layerId) {
    var elem = "";

    $.each(BDQueimadas.obj.getMapSubtitleConfig().MapSubtitle, function(i, mapSubtitleItem) {
      if(mapSubtitleItem.Layer === layerId)
        elem += "<li class=\"" + layerId.replace(':', '') + "\"><a><div style=\"" + mapSubtitleItem.Css + "\"></div><span>" + mapSubtitleItem.SubtitleText + "</span></a></li>";
    });

    $('#map-subtitle-items').append(elem);
  };

  var removeSubtitle = function(layerId) {
    $("#map-subtitle-items > li." + layerId.replace(':', '')).remove();
  };

  var showSubtitle = function(layerId) {
    if(!$("#map-subtitle-items > li." + layerId.replace(':', '')).is(":visible"))
      $("#map-subtitle-items > li." + layerId.replace(':', '')).show();
  };

  var hideSubtitle = function(layerId) {
    if($("#map-subtitle-items > li." + layerId.replace(':', '')).is(":visible"))
      $("#map-subtitle-items > li." + layerId.replace(':', '')).hide();
  };

  var init = function() {};

  return {
    init: init,
    addSubtitle: addSubtitle,
    removeSubtitle: removeSubtitle,
    showSubtitle: showSubtitle,
    hideSubtitle: hideSubtitle
  };
})();
