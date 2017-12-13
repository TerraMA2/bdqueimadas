"use strict";

/**
 * Access statistics controller.
 * @class AccessStatisticsController
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 */
var AccessStatisticsController = function(app) {

  /**
   * Processes the request and returns a response.
   * @param {json} request - JSON containing the request data
   * @param {json} response - JSON containing the response data
   *
   * @function accessStatisticsController
   * @memberof AccessStatisticsController
   * @inner
   */
  var accessStatisticsController = function(request, response) {
    response.render('admin/index', { content: 'pages/accessStatistics', currentPage: 'AccessStatistics', mainTitle: 'Estatísticas de Acesso' });
  };

  return {
    accessStatisticsController: accessStatisticsController
  };
};

module.exports = AccessStatisticsController;
