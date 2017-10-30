"use strict";

/**
 * Deletion of fires class of the BDQueimadasAdmin.
 * @class DeletionOfFires
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 */
define(
  ['components/Utils'],
  function(Utils) {

    var loadEvents = function() {
      $("#continents").change(function() {
        if($(this).val() !== "")
          Utils.getSocket().emit('countriesByContinentRequest', { continent: $(this).val() });
        else {
          $("#countries").empty().html("");
          $("#countries").attr('disabled', 'disabled');

          $("#states").empty().html("");
          $("#states").attr('disabled', 'disabled');
        }
      });

      $("#countries").change(function() {
        if(!Utils.stringInArray($(this).val(), ""))
          Utils.getSocket().emit('statesByCountriesRequest', { countries: $(this).val() });
        else {
          $("#states").empty().html("");
          $("#states").attr('disabled', 'disabled');
        }
      });

      $("#delete-fires").on("click", function() {
        $("#region").val($("#region-one").val() + "," + $("#region-two").val() + "," + $("#region-three").val() + "," + $("#region-four").val());
        $("form").submit();
      });

      Utils.getSocket().on('countriesByContinentResponse', function(result) {
        var html = "<option value=\"\" selected>Todos os pa&iacute;ses</option>";

        for(var i = 0, countriesCount = result.countries.rowCount; i < countriesCount; i++) {
          var countryName = result.countries.rows[i].name;

          if(result.countries.rows[i].name === "Falkland Islands") {
            countryName = "I.Malvinas/Falkland";
          } else if(result.countries.rows[i].name === "Brazil") {
            countryName = "Brasil";
          }

          html += "<option value='" + result.countries.rows[i].id + "'>" + countryName + "</option>";
        }

        $("#countries").empty().html(html);
        $("#countries").removeAttr('disabled');

        $("#states").empty().html("");
        $("#states").attr('disabled', 'disabled');
      });

      Utils.getSocket().on('statesByCountriesResponse', function(result) {
        var html = "<option value=\"\" selected>Todos os estados</option>";

        for(var i = 0, statesCount = result.states.rowCount; i < statesCount; i++)
          html += "<option value='" + result.states.rows[i].id + "'>" + result.states.rows[i].name + "</option>";

        $("#states").empty().html(html);
        $("#states").removeAttr('disabled');
      });
    };

    /**
     * Initializes the necessary features.
     *
     * @function init
     * @memberof DeletionOfFires
     * @inner
     */
    var init = function() {
      $(document).ready(function() {
        loadEvents();
      });
    };

    return {
    	init: init
    };
  }
);
