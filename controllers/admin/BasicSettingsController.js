"use strict";

/**
 * BasicSettings controller.
 * @class BasicSettingsController
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberBasicSettings - 'BasicSettings' model.
 */
var BasicSettingsController = function(app) {

  // 'BasicSettings' model
  var memberBasicSettings = new (require('../../models/admin/BasicSettings.js'))();

  /**
   * Processes the request and returns a response.
   * @param {json} request - JSON containing the request data
   * @param {json} response - JSON containing the response data
   *
   * @function basicSettingsController
   * @memberof BasicSettingsController
   * @inner
   */
  var basicSettingsController = function(request, response) {
    memberBasicSettings.getInitialMessageData(function(err, initialMessageData) {
      if(err) return console.error(err);

      response.render('admin/index', { content: 'pages/basicSettings', currentPage: 'BasicSettings', mainTitle: 'Configurações Básicas', initialMessage: initialMessageData.rows[0].message, initialMessageTime: initialMessageData.rows[0].time });
    });
  };

  /**
   * Processes the request and returns a response.
   * @param {json} request - JSON containing the request data
   * @param {json} response - JSON containing the response data
   *
   * @function updateBasicSettings
   * @memberof BasicSettingsController
   * @inner
   */
  var updateBasicSettings = function(request, response) {
    var initialMessage = (request.body.initialMessage != "" ? request.body.initialMessage : null);
    var initialMessageTime = (request.body.initialMessageTime != "" ? request.body.initialMessageTime : null);

    memberBasicSettings.setInitialMessageData(initialMessage, initialMessageTime, function(err, result) {
      if(err) return console.error(err);

      response.redirect(BASE_URL + 'admin/basic-settings');
    });
  };

  return {
    basicSettingsController: basicSettingsController,
    updateBasicSettings: updateBasicSettings
  };
};

module.exports = BasicSettingsController;
