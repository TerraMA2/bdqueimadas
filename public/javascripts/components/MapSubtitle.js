"use strict";

BDQueimadas.components.MapSubtitle = (function() {

  var addSubtitle = function(layerId) {
    var elem = "";

    $.each(BDQueimadas.obj.getMapSubtitleConfig().MapSubtitle, function(i, mapSubtitleItem) {
      if(mapSubtitleItem.Layer === layerId)
        elem += "<li class=\"" + layerId.replace(':', '') + "\"><a><div style=\"" + mapSubtitleItem.Css + "\"></div><span>" + mapSubtitleItem.SubtitleText + "</span></a></li>";
    });

    $('#map-subtitle-items').append(elem);

    updateZoomTop(false);
  };

  var removeSubtitle = function(layerId) {
    $("#map-subtitle-items > li." + layerId.replace(':', '')).remove();

    updateZoomTop(false);
  };

  var showSubtitle = function(layerId) {
    if(!$("#map-subtitle-items > li." + layerId.replace(':', '')).is(":visible"))
      $("#map-subtitle-items > li." + layerId.replace(':', '')).show();

    updateZoomTop(false);
  };

  var hideSubtitle = function(layerId) {
    if($("#map-subtitle-items > li." + layerId.replace(':', '')).is(":visible"))
      $("#map-subtitle-items > li." + layerId.replace(':', '')).hide();

    updateZoomTop(false);
  };

  // new

  var updateZoomTop = function(toggle) {
    if($('.map-subtitle-toggle').parent().parent().parent().hasClass('collapsed-box') || !toggle)
      $('#terrama2-map .ol-zoom').animate({ 'top': '221px' }, { duration: 500, queue: false });
    else
      $('#terrama2-map .ol-zoom').animate({ 'top': '70px' }, { duration: 500, queue: false });
  };

  var loadEvents = function() {
    $('.map-subtitle-toggle').on('click', function() {
      updateZoomTop(true);
    });
  };

  // new

  var init = function() {
    loadEvents();
  };

  return {
    init: init,
    addSubtitle: addSubtitle,
    removeSubtitle: removeSubtitle,
    showSubtitle: showSubtitle,
    hideSubtitle: hideSubtitle
  };
})();
