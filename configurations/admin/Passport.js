var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var request = require('request');
var authorizedUsers = new (require('../../models/admin/AuthorizedUsers.js'))();
var path = require('path');
var fs = require('fs');
var applicationConfigurations = JSON.parse(fs.readFileSync(path.join(__dirname, '../Application.json'), 'utf8'));

var isAuthenticated = function(req, res, next) {
  if(req.isAuthenticated())
    return next();

  res.redirect(BASE_URL + 'admin/login');
};

var setupPassport = function(app) {
  app.use(passport.initialize());
  app.use(passport.session());

  app.use(function(req, res, next) {
    if(req.session.passport !== undefined && req.session.passport.user !== undefined) {
      res.locals.currentUser = req.session.passport.user;
      next();
    } else {
      res.locals.currentUser = null;
      next();
    }
  });

  passport.use(new localStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    function(email, password, done) {
      request.post({
        url: applicationConfigurations.LoginAction,
        form: {
          email: email,
          password: password
        },
        json: true
      }, function(err, httpResponse, body) {
        if(err)
          return done(null, false, { message: "Login falhou, tente novamente." });

        if(body.users === undefined || body.users.length !== 1)
          return done(null, false, { message: "Usuário ou senha incorretos!" });

        authorizedUsers.getAuthorizedUsers(function(err, authorizedUsersList) {
          if(err)
            return done(null, false, { message: "Login falhou, tente novamente." });

          var authorized = false;

          for(var i = 0, authorizedUsersLength = authorizedUsersList.rows.length; i < authorizedUsersLength; i++) {
            if(email === authorizedUsersList.rows[i].email) {
              authorized = true;
              break;
            }
          }

          if(authorized)
            return done(null, body.users[0]);
          else
            return done(null, false, { message: "Usuário sem permissão de acesso!" });
        });
      });
    }
  ));

  passport.serializeUser(function(userObj, done) {
    return done(null, userObj);
  });

  passport.deserializeUser(function(userObj, done) {
    return done(null, userObj);
  });
};

module.exports = {
  isAuthenticated: isAuthenticated,
  setupPassport: setupPassport
};
