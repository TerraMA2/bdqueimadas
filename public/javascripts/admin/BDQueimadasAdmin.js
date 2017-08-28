requirejs.config({
  baseUrl: BASE_URL + 'javascripts/admin'
});

requirejs(
  ['components/Utils', 'components/Downloads', 'components/AuthorizedUsers', 'components/AccessStatistics', 'components/DeletionOfFires'],
  function(Utils, Downloads, AuthorizedUsers, AccessStatistics, DeletionOfFires) {
    // Adding the CSRF token to the ajax requests
    $.ajaxPrefilter(function(options, _, xhr) {
      if(!xhr.crossDomain) xhr.setRequestHeader('X-CSRF-Token', $('#_csrf').val());
    });

    $(".date").inputmask("yyyy/mm/dd", {"placeholder": "aaaa/mm/dd"});
    $(".time").inputmask("99:99", {"placeholder": "hh:mm"});

    $(".date").datepicker({
      "maxDate": 0,
      "markerClassName": "hasDatepicker",
      "dateFormat": "yy/mm/dd",
      "dayNames": ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"],
      "dayNamesMin": ["D","S","T","Q","Q","S","S","D"],
      "dayNamesShort": ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb","Dom"],
      "monthNames": ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"],
      "monthNamesShort": ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"],
      "nextText": "Próximo",
      "prevText": "Anterior"
    });

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
      case "DeletionOfFires":
        DeletionOfFires.init();
        break;
    }
  }
);
