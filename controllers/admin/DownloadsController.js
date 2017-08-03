"use strict";

/**
 * Downloads controller.
 * @class DownloadsController
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberDownloads - 'Downloads' model.
 */
var DownloadsController = function(app) {

  // 'Downloads' model
  var memberDownloads = new (require('../../models/admin/Downloads.js'))();

  /**
   * Processes the request and returns a response.
   * @param {json} request - JSON containing the request data
   * @param {json} response - JSON containing the response data
   *
   * @function downloadsController
   * @memberof DownloadsController
   * @inner
   */
  var downloadsController = function(request, response) {
    response.render('admin/index', { content: 'pages/downloads', currentPage: 'Downloads', mainTitle: 'Downloads' });
  };

  /**
   * Processes the request and returns a response.
   * @param {json} request - JSON containing the request data
   * @param {json} response - JSON containing the response data
   *
   * @function getDownloadsTable
   * @memberof DownloadsController
   * @inner
   */
  var getDownloadsTable = function(request, response) {
    var order = {
      column: request.body.columns[request.body.order[0].column].name,
      dir: request.body.order[0].dir
    };

    // Call of the method 'getDownloadsTableData', responsible for returning data of the attributes table accordingly with the request parameters
    memberDownloads.getDownloadsTableData(request.body.length, request.body.start, request.body.search.value, request.body.initialDate, request.body.finalDate, order, function(err, result) {
      if(err) return console.error(err);

      // Call of the method 'getDownloadsTableCount', responsible for returning the number of rows of the attributes table accordingly with the request parameters, not considering the table search
      memberDownloads.getDownloadsTableCount(request.body.initialDate, request.body.finalDate, function(err, resultCount) {
        if(err) return console.error(err);

        // Call of the method 'getDownloadsTableCount', responsible for returning the number of rows of the attributes table accordingly with the request parameters, considering the table search
        memberDownloads.getDownloadsTableCountWithSearch(request.body.initialDate, request.body.finalDate, request.body.search.value, function(err, resultCountWithSearch) {
          if(err) return console.error(err);

          // Array responsible for keeping the data obtained by the method 'getDownloadsTableData'
          var data = [];

          // Conversion of the result object to array
          result.rows.forEach(function(val) {
            var temp = [];
            for(var key in val) temp.push(val[key]);
            data.push(temp);
          });

          // JSON response
          response.json({
            draw: parseInt(request.body.draw),
            recordsTotal: parseInt(resultCount.rows[0].count),
            recordsFiltered: parseInt(resultCountWithSearch.rows[0].count),
            data: data
          });
        });
      });
    });
  };

  return {
    downloadsController: downloadsController,
    getDownloadsTable: getDownloadsTable
  };
};

module.exports = DownloadsController;
