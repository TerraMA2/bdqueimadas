const KEY = 'bdqueimadas.sid';

var express = require('express'),
    path = require('path'),
    load = require('express-load'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    error = require('./middlewares/error'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io')(server);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

io.use(function(socket, next) {
  var data = socket.request;
  cookie(data, {}, function(err) {
    var sessionID = data.signedCookies[KEY];
    store.get(sessionID, function(err, session) {
      if(err || !session) {
        return next(new Error('Access denied!'));
      } else {
        socket.handshake.session = session;
        return next();
      }
    });
  });
});

load('controllers')
  .then('routes')
  .into(app);

load('sockets').into(io);

app.use(error.notFound);
app.use(error.serverError);

module.exports = app;

server.listen(3000, function() {
  console.log("Bdqueimadas running!");
});
