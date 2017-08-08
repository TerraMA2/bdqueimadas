"use strict";

/**
 * Authorized users class of the BDQueimadasAdmin.
 * @class AuthorizedUsers
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 */
define(
  ['components/Utils'],
  function(Utils) {

    var savedScreen = function(self) {
      var saveButton = self.parent().find('> .save-button');
      var editButton = self.parent().find('> .edit-button');
      var emailInput = self.parent().parent().find('> .email-column > input');
      var emailSpan = self.parent().parent().find('> .email-column > span');

      if(!saveButton.hasClass('hidden'))
        saveButton.addClass('hidden');

      if(editButton.hasClass('hidden'))
        editButton.removeClass('hidden');

      if(!emailInput.hasClass('hidden'))
        emailInput.addClass('hidden');

      if(emailSpan.hasClass('hidden'))
        emailSpan.removeClass('hidden');
    };

    /**
     * Loads the class events.
     *
     * @private
     * @function loadEvents
     * @memberof AuthorizedUsers
     * @inner
     */
    var loadEvents = function() {
      $("#users-table > tbody").on("click", ".edit-button", function() {
        var self = $(this);

        if(!self.parent().find('> .edit-button').hasClass('hidden'))
          self.parent().find('> .edit-button').addClass('hidden');

        if(self.parent().find('> .save-button').hasClass('hidden'))
          self.parent().find('> .save-button').removeClass('hidden');

        if(!self.parent().parent().find('> .email-column > span').hasClass('hidden'))
          self.parent().parent().find('> .email-column > span').addClass('hidden');

        if(self.parent().parent().find('> .email-column > input').hasClass('hidden'))
          self.parent().parent().find('> .email-column > input').removeClass('hidden');
      });

      $("#users-table > tbody").on("click", ".save-button", function() {
        var self = $(this);
        var emailInput = self.parent().parent().find('> .email-column > input');
        var emailSpan = self.parent().parent().find('> .email-column > span');

        if(self.data('id') !== "") {
          $.post(Utils.getBaseUrl() + 'admin/users/update', {
            id: self.data('id'),
            email: emailInput.val()
          }, function(data) {
            if(data.error !== null)
              emailInput.val(emailSpan.text());  
            else
              emailSpan.text(emailInput.val());

            savedScreen(self);
          });
        } else {
          $.post(Utils.getBaseUrl() + 'admin/users/add', {
            email: emailInput.val()
          }, function(data) {
            if(data.error !== null) {
              self.parent().parent().remove();
            } else {
              emailSpan.text(emailInput.val());
              self.data('id', data.user.rows[0].id);
              self.parent().parent().find('> .remove-column > button').data('id', data.user.rows[0].id);
              savedScreen(self);
            }
          });
        }
      });

      $("#users-table > tbody").on("click", ".remove-button", function() {
        var self = $(this);

        var removeHtml = function() {
          var trsLength = self.parent().parent().parent().find('> tr').length;
          var noDataTr = self.parent().parent().parent().find('> .no-data');

          self.parent().parent().remove();

          if(trsLength === 2 && noDataTr.hasClass('hidden'))
            noDataTr.removeClass('hidden');
        };

        if(self.data('id') !== "") {
          $.post(Utils.getBaseUrl() + 'admin/users/delete', {
            id: self.data('id')
          }, function(data) {
            if(data.error === null)
              removeHtml();
          });
        } else {
          removeHtml();
        }
      });

      $(".new-button").on("click", function() {
        var noDataTr = $('#users-table > tbody > .no-data');

        if(!noDataTr.hasClass('hidden'))
          noDataTr.addClass('hidden');

        $('#users-table > tbody').append(
          "<tr>" +
            "<td class=\"email-column\">" +
              "<span class=\"hidden\"></span>" +
              "<input type=\"text\" class=\"form-control\" value=\"\"/>" +
            "</td>" +
            "<td class=\"edit-column\">" +
              "<button class=\"btn btn-default save-button\" data-id=\"\"><i class=\"fa fa-check\"></i></button>" +
              "<button class=\"btn btn-default edit-button hidden\"><i class=\"fa fa-pencil\"></i></button>" +
            "</td>" +
            "<td class=\"remove-column\">" +
              "<button class=\"btn btn-danger remove-button\" data-id=\"\"><i class=\"fa fa-remove\"></i></button>" +
            "</td>" +
          "</tr>"
        );
      });
    };

    /**
     * Initializes the necessary features.
     *
     * @function init
     * @memberof AuthorizedUsers
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
