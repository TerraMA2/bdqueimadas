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
    csrf = require('csurf');

var applicationConfigurations = JSON.parse(fs.readFileSync(path.join(__dirname, './configurations/Application.json'), 'utf8'));

BASE_URL = applicationConfigurations.BaseUrl;

app.use(cookieParser());
app.use(session({
  secret: KEY,
  resave: true,
  saveUninitialized: false
}));
app.use(csrf());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

load('controllers').then('routes').into(app);

module.exports = app;
