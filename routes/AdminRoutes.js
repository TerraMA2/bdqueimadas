"use strict";

/**
 * Route of the Admin system.
 * @class AdminRoutes
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 */
var AdminRoutes = function(app) {
  var getDonwloadsTableController = app.controllers.admin.GetDownloadsTableController;

  app.get('/admin', function(request, response) {
    //response.render('adminTemplate');
    require('request').post({
      url: 'https://devwww-queimadas.dgi.inpe.br/queimadas/extranet/loginUsuario',
      form: {
        email: 'jean',
        password: 'lala'
      }
    }, function(err, httpResponse, body) {
      if(err)
        console.error(err);

      console.log(body);
    });
  });

  app.get('/admin/downloads', function(request, response) {
    response.render('adminTemplate', { content: 'adminPages/downloads', csrf: request.csrfToken() });
  });

  app.post('/admin/get-downloads-table', getDonwloadsTableController);
};

module.exports = AdminRoutes;
