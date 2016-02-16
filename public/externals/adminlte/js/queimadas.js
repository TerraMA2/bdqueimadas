$('.main-sidebar').attr("style", "padding-top: " + $('.main-header').outerHeight() + "px");

$(".sidebar-toggle").on('click', function(){
  if(!$("body").hasClass('sidebar-collapse')) {
    $("#extra-footer > p").hide();
    $("#reduced-footer > div").animate({ height: '4px' }, 300);
    $("#footer").hide();
    $("#extra-footer").animate({ height: '4px' }, 300);

    $("#gov-header").animate({ 'margin-top': '-' + $("#gov-header").height() }, 300);
    window.setTimeout(function() { $("#gov-header").css("display", "none"); }, 300);

    $(".main-sidebar").animate({ 'padding-top': $('.navbar').height() + 'px' }, 300);
  } else {
    $("#reduced-footer > div").animate({ height: '0px' }, 300);
    $("#footer").show();
    $("#extra-footer").animate({ height: '100%' }, 300);

    $("#gov-header").css("display", "");
    $("#gov-header").animate({ 'margin-top': '0' }, 300);

    $("#extra-footer > p").show();

    $(".main-sidebar").animate({ 'padding-top': $('.main-header').height() + 'px' }, 300);
  }
});
