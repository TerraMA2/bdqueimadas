const KEY = 'bdqueimadas.sid';

var express = require('express'),
    path = require('path'),
    load = require('express-load'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    app = express(),
    server = require('http').Server(app),
    fs = require('fs'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    csrf = require('csurf'),
    i18n = require( "i18n" );

var applicationConfigurations = JSON.parse(fs.readFileSync(path.join(__dirname, './configurations/Application.json'), 'utf8'));

BASE_URL = applicationConfigurations.BaseUrl;

app.use(cookieParser());
app.use(session({
  secret: KEY,
  resave: true,
  saveUninitialized: false
}));
app.use(csrf());

// Setting internationalization
i18n.configure({
  locales       : ["pt", "en", "es"],
  directory     : __dirname + "/locales",
  objectNotation: true
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(i18n.init);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  var match = req.url.match(/^\/([A-Z]{2})([\/\?].*)?$/i);
  if(match) {
    req.lang = match[1];
    req.url = match[2] || '/';

    if(req.lang !== undefined && (req.lang === 'es' || req.lang === 'en'))
      res.setLocale(req.lang);
  }
  next();
});

module.exports = app;
