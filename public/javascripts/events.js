$(document).ready(function() {

  var regularMap = true;

  $("#maximize-map-button").on('click', function() {
    if(regularMap) {
      regularMap = false;
      $(".top").addClass("minor");
      $(".top-title").css("display", "none");
      $(".top-language").css("display", "none");
      $(".footer").addClass("minor");
      $(".footer-text").css("display", "none");
      $("#maximized-map-logos").removeClass("hide");
      $(".content").addClass("bigger");
      $(this).removeClass("maximize-map").addClass("minimize-map");
      terrama2.getMapDisplay().updateMapSize();
    } else {
      regularMap = true;
      $(".top").removeClass("minor");
      $(".top-title").css("display", "");
      $(".top-language").css("display", "");
      $(".footer").removeClass("minor");
      $(".footer-text").css("display", "");
      $("#maximized-map-logos").addClass("hide");
      $(".content").removeClass("bigger");
      $(this).removeClass("minimize-map").addClass("maximize-map");
      terrama2.getMapDisplay().updateMapSize();
    }
  });
});
