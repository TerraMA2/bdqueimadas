"use strict";

/**
 * Downloads table class of the BDQueimadasAdmin.
 * @class Downloads
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberDownloadsTable - Downloads table object (DataTables).
 * @property {date} memberInitialDate - Current initial date / time filter.
 * @property {date} memberFinalDate - Current final date / time filter.
 */
define(
  [],
  function() {

    // Downloads table object (DataTables)
    var memberDownloadsTable = null;
    // Current initial date / time filter
    var memberInitialDate = null;
    // Current final date / time filter
    var memberFinalDate = null;

    /**
     * Loads the downloads table.
     *
     * @private
     * @function loadDownloadsTable
     * @memberof Downloads
     * @inner
     */
    var loadDownloadsTable = function() {
      memberInitialDate = $("#initial-date").val() + ' 00:00:00';
      memberFinalDate = $("#final-date").val() + ' 23:59:59';

      memberDownloadsTable = $('#downloads-table').DataTable(
        {
          "order": [0, "desc"],
          "processing": true,
          "serverSide": true,
          "ajax": {
            "url": "/admin/get-downloads-table",
            "type": "POST",
            "data": function(data) {
              data.initialDate = memberInitialDate;
              data.finalDate = memberFinalDate;
            }
          },
          "columns": [
            { "name": "data_hora_char" },
            { "name": "ip" },
            { "name": "filtro_inicio" },
            { "name": "filtro_fim" },
            { "name": "filtro_satelites" },
            { "name": "filtro_biomas" },
            { "name": "filtro_paises" },
            { "name": "filtro_estados" },
            { "name": "filtro_cidades" },
            { "name": "filtro_formato" }
          ],
          "language": {
            "emptyTable": "<p class='text-center'>Nenhum registro a ser exibido</p>",
            "info": "Exibindo _START_ at&eacute; _END_ de _TOTAL_ registros",
            "infoEmpty": "Exibindo 0 at&eacute; 0 de 0 registros",
            "infoFiltered": "(filtrado de _MAX_ registros)",
            "lengthMenu": "Exibir _MENU_ registros",
            "loadingRecords": "Carregando...",
            "processing": "Processando...",
            "search": "Pesquisa:",
            "zeroRecords": "<p class='text-center'>Nenhum registro encontrado</p>",
            "paginate": {
              "first": "Primeira",
              "last": "&Uacute;ltima",
              "next": "Pr&oacute;xima",
              "previous": "Anterior"
            }
          }
        }
      );
    };

    /**
     * Updates the attributes table.
     *
     * @function updateDownloads
     * @memberof Downloads
     * @inner
     */
    var updateDownloads = function() {
      memberInitialDate = $("#initial-date").val() + ' 00:00:00';
      memberFinalDate = $("#final-date").val() + ' 23:59:59';

      memberDownloadsTable.ajax.reload();
    };

    var loadEvents = function() {
      $("#filter-downloads").on("click", function() {
        updateDownloads();
      });
    };

    /**
     * Initializes the necessary features.
     *
     * @function init
     * @memberof Downloads
     * @inner
     */
    var init = function() {
      $(document).ready(function() {
        loadEvents();
        loadDownloadsTable();
      });
    };

    return {
      updateDownloads: updateDownloads,
    	init: init
    };
  }
);
