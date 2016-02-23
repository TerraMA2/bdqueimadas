module.exports = function(app) {
  var path = require('path'),
      fs = require('fs');

  function indexController(request, response) {

    var filterConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../configurations/filter.json'), 'utf8')),
        serverConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../configurations/server.json'), 'utf8')),
        attributesTableConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../configurations/attributestable.json'), 'utf8'));

    var params = {
      filterConfig: filterConfig,
      serverConfig: serverConfig,
      attributesTableConfig: attributesTableConfig
    };

    response.render('index', params);
  };

  return indexController;
};
