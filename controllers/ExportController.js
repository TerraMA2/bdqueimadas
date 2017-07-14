"use strict";

/**
 * Controller responsible for export the fires data.
 * @class ExportController
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 *
 * @property {object} memberFs - 'fs' module.
 * @property {object} memberPath - 'path' module.
 * @property {object} memberUtils - 'Utils' model.
 */
var ExportController = function(app) {

  // 'fs' module
  var memberFs = require('fs');
  // 'path' module
  var memberPath = require('path');
  // 'Utils' model
  var memberUtils = new (require('../models/Utils.js'))();

  /**
   * Processes the request and returns a response.
   * @param {json} request - JSON containing the request data
   * @param {json} response - JSON containing the response data
   *
   * @function exportController
   * @memberof ExportController
   * @inner
   */
  var exportController = function(request, response) {
    var finalPath = memberPath.join(__dirname, '../tmp/' + request.query.folder) + "/" + request.query.file;

    response.download(finalPath, request.query.file, function(err) {
      if(err) return console.error(err);

      memberUtils.deleteFolderRecursively(memberPath.join(__dirname, '../tmp/' + request.query.folder), function() {});
    });

    deleteInvalidFolders();
  };

  /**
   * Returns the difference in days between the current date and a given date.
   * @param {string} dateString - Date (YYYY-MM-DD)
   * @returns {integer} difference - Difference between the dates
   *
   * @private
   * @function getDateDifferenceInDays
   * @memberof ExportController
   * @inner
   */
  var getDateDifferenceInDays = function(dateString) {
    var now = new Date();
    var date = new Date(dateString + " " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds());

    var utc1 = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    var utc2 = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());

    var difference = Math.floor((utc1 - utc2) / (1000 * 3600 * 24));

    return difference;
  };

  /**
   * Deletes the invalid folders (older than one day) from the tmp folder.
   *
   * @private
   * @function deleteInvalidFolders
   * @memberof ExportController
   * @inner
   */
  var deleteInvalidFolders = function() {
    var tmpDir = memberPath.join(__dirname, '../tmp');
    var dirs = memberFs.readdirSync(tmpDir).filter(file => memberFs.statSync(memberPath.join(tmpDir, file)).isDirectory());

    for(var i = 0, count = dirs.length; i < count; i++) {
      var dir = memberPath.join(__dirname, '../tmp/' + dirs[i]);
      var date = dirs[i].split('_--_');

      if(getDateDifferenceInDays(date[1]) > 1)
        memberUtils.deleteFolderRecursively(dir, function() {});
    }
  };

  return exportController;
};

module.exports = ExportController;
