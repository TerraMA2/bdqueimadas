"use strict";

/**
 * Deletion of fires controller.
 * @class DeletionOfFiresController
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberFilter - Filter model.
 */
var DeletionOfFiresController = function(app) {

  // Filter model
  var memberFilter = new (require('../../models/Filter.js'))();

  /**
   * Processes the request and returns a response.
   * @param {json} request - JSON containing the request data
   * @param {json} response - JSON containing the response data
   *
   * @function deletionOfFiresController
   * @memberof DeletionOfFiresController
   * @inner
   */
  var deletionOfFiresController = function(request, response) {
    memberFilter.getAllContinents(function(err, result) {
      if(err) return console.error(err);

      response.render('admin/index', { content: 'pages/deletionOfFires', currentPage: 'DeletionOfFires', mainTitle: 'Exclusão de Focos', continents: result });
    });
  };

  /**
   * Processes the request and returns a response.
   * @param {json} request - JSON containing the request data
   * @param {json} response - JSON containing the response data
   *
   * @function deletionOfFiresConfirmationController
   * @memberof DeletionOfFiresController
   * @inner
   */
  var deletionOfFiresConfirmationController = function(request, response) {
    console.log(request.body);
    response.render('admin/index', { content: 'pages/deletionOfFiresConfirmation', currentPage: 'DeletionOfFires', mainTitle: 'Confirmação de Exclusão de Focos' });
  };

  return {
    deletionOfFiresController: deletionOfFiresController,
    deletionOfFiresConfirmationController: deletionOfFiresConfirmationController
  };
};

module.exports = DeletionOfFiresController;
