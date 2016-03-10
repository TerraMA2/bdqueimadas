const KEY = 'bdqueimadas.sid';

terrama2Path = "http://localhost:37000";

var express = require('express'),
    path = require('path'),
    load = require('express-load'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    favicon = require('serve-favicon'),
    //error = require('./middlewares/error'),
    app = express(),
    server = require('http').Server(app);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

load('controllers')
  .then('routes')
  .into(app);

//app.use(error.notFound);
//app.use(error.serverError);

module.exports = app;
