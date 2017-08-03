requirejs.config({
  baseUrl: BASE_URL + 'javascripts/admin'
});

requirejs(
  ['components/Utils', 'components/Downloads', 'components/AuthorizedUsers', 'components/AccessStatistics'],
  function(Utils, Downloads, AuthorizedUsers, AccessStatistics) {
    // Adding the CSRF token to the ajax requests
    $.ajaxPrefilter(function(options, _, xhr) {
      if(!xhr.crossDomain) xhr.setRequestHeader('X-CSRF-Token', $('#_csrf').val());
    });

    $(".date").inputmask("yyyy/mm/dd", {"placeholder": "aaaa/mm/dd"});
    $(".time").inputmask("99:99", {"placeholder": "hh:mm"});

    Utils.init(BASE_URL);

    switch(currentPage) {
      case "Downloads":
        Downloads.init();
        break;
      case "AuthorizedUsers":
        AuthorizedUsers.init();
        break;
      case "AccessStatistics":
        AccessStatistics.init();
        break;
    }
  }
);
