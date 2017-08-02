requirejs.config({
  baseUrl: '/javascripts/admin'
});

requirejs(
  ['components/Downloads', 'components/AuthorizedUsers', 'components/BasicSettings'],
  function(Downloads, AuthorizedUsers, BasicSettings) {
    // Adding the CSRF token to the ajax requests
    $.ajaxPrefilter(function(options, _, xhr) {
      if(!xhr.crossDomain) xhr.setRequestHeader('X-CSRF-Token', $('#_csrf').val());
    });

    $(".date").inputmask("yyyy/mm/dd", {"placeholder": "aaaa/mm/dd"});
    $(".time").inputmask("99:99", {"placeholder": "hh:mm"});

    var datePickerOptions = {
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
    };

    $("#initial-date").datepicker(datePickerOptions);
    $("#final-date").datepicker(datePickerOptions);

    var date = new Date();
    var finalDate = date.getFullYear() + "/" + ('0' + (date.getMonth() + 1)).slice(-2) + "/" + ('0' + date.getDate()).slice(-2);
    date.setDate(date.getDate() - 1);
    var initialDate = date.getFullYear() + "/" + ('0' + (date.getMonth() + 1)).slice(-2) + "/" + ('0' + date.getDate()).slice(-2);

    $("#initial-date").val(initialDate);
    $("#final-date").val(finalDate);

    Downloads.init();
    AuthorizedUsers.init();
    BasicSettings.init();
  }
);
