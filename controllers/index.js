module.exports = function(app) {
  var path = require('path'),
      filterConfig = require(path.join(__dirname, '../configurations/filter.json')),
      serverConfig = require(path.join(__dirname, '../configurations/server.json'));

  function indexController(request, response) {
    var params = {
      filterConfig: filterConfig,
      serverConfig: serverConfig
    };

    response.render('index', params);
  };

  return indexController;
};
