"use strict";

var passport = require('passport');

/**
 * Route of the Admin system login.
 * @class Login
 *
 * @author Jean Souza [jean.souza@funcate.org.br]
 */
var Login = function(app) {
  app.post('/admin/login/process', function(request, response, next) {
    passport.authenticate('local', function(err, user, info) {
      if(err)
        next(err);

      if(!user) {
        request.flash('message', info.message + "<br/><br/>");
        return response.redirect('/admin/login');
      }

      request.logIn(user, function(e) {
        if(e)
          return next(e);

        return response.redirect('/admin');
      })
    })(request, response, next);
  });

  app.get('/admin/login', function(request, response) {
    response.render('admin/login', { message: request.flash('message') });
  });

  app.get('/admin/logout', function(request, response) {
    request.logout();
    response.redirect('/admin');
  });
};

module.exports = Login;
