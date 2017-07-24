var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var memberRequest = require('request');
var memberAuthorizedUsers = new (require('../../models/admin/AuthorizedUsers.js'))();

/**
 * Middleware to check if current user is authenticated and redirect him to correct path
 * 
 * @param {Request} req - Express request instance
 * @param {Response} res - Express response instance
 */
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

  passport.use(new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    function(email, password, done) {
      memberRequest.post({
        url: 'https://devwww-queimadas.dgi.inpe.br/queimadas/extranet/loginUsuario',
        form: {
          email: email,
          password: password
        },
        json: true
      }, function(err, httpResponse, body) {
        if(err)
          return done(null, false, { message: "Login falhou, tente novamente." });

        if(body.users.length !== 1)
          return done(null, false, { message: "Usuário ou senha incorretos!" });

        memberAuthorizedUsers.getAuthorizedUsers(function(err, authorizedUsers) {
          if(err)
            return done(null, false, { message: "Login falhou, tente novamente." });

          var authorized = false;

          for(var i = 0, authorizedUsersLength = authorizedUsers.rows.length; i < authorizedUsersLength; i++) {
            if(email === authorizedUsers.rows[i].email) {
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
