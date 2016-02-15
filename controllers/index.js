module.exports = function(app) {
  var IndexController = {
    index: function(req, res) {
      var fs = require('fs'),
          path = require('path'),
          filterConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/config/filter.json'), 'utf8')),
          serverConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/config/server.json'), 'utf8')),
          params = {
            filterConfig: filterConfig,
            serverConfig: serverConfig
          };
      res.render('index', params);
    }
  };
  return IndexController;
};
