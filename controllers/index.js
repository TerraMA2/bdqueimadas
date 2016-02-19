module.exports = function(app) {
  return {
    index: function(req, res) {
      var fs = require('fs'),
          path = require('path'),
          filterConfig = require(path.join(__dirname, '../configurations/filter.json')),
          serverConfig = require(path.join(__dirname, '../configurations/server.json')),
          params = {
            filterConfig: filterConfig,
            serverConfig: serverConfig
          };

      res.render('index', params);
    }
  };
};
