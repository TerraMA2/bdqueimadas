const KEY = 'bdqueimadas.sid';

terrama2Path = "http://localhost:37000";

var express = require('express'),
    path = require('path'),
    load = require('express-load'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    //error = require('./middlewares/error'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io')(server);

require('events').EventEmitter.prototype._maxListeners = 100;

require(path.join(__dirname, 'modules/PgConnector.js')).initDb();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

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
