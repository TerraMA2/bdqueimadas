requirejs.config({
  baseUrl: '/javascripts/admin'
});

requirejs(
  ['components/Downloads'],
  function(Downloads) {
    // Adding the CSRF token to the ajax requests
    $.ajaxPrefilter(function(options, _, xhr) {
      if(!xhr.crossDomain) xhr.setRequestHeader('X-CSRF-Token', $('#_csrf').val());
    });

    Downloads.init();
  }
);
