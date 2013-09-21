var express = require('express'),
  app = express(),
  socketio = require('socket.io'),
  EventEmitter = require('events').EventEmitter,
  mBus = new EventEmitter(),
  sockets = require('../util/sockets'),
  appDir = require('../util/appDir'),
  routes = require('../routes'),
  port = process.env.PORT || 8280;

function logErrors(err, req, res, next) {
  console.error(err.stack);
  next(err);
}

function clientErrorHandler(err, req, res, next) {
  if (req.xhr) {
    res.send(500, { error: 'Something blew up!' });
  } else {
    next(err);
  }
}

module.exports = function(model, db) {
var server = require('http').createServer(app),
  io = socketio.listen(server);

io.set('log level', 1);

sockets(io, mBus);

app.configure(function() {
  app.set('port', port);
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(app.router);
  app.use(express['static'](__dirname + '/../public'));
  app.use(logErrors);
  app.use(clientErrorHandler);
});

var initParams = {
  mBus: mBus,
  musicDir: appDir('music')
};

routes.currentlyplaying.init(initParams);
routes.upload.init(initParams);

app.get('/playlist/:id', routes.playlist.index);

app.get('/track/:id', routes.track.index);
app.post('/track/:id', routes.track.update);

app.get('/currentlyplaying', routes.currentlyplaying.index);
app.get('/searchtracks', routes.searchtracks.index);

app.post('/upload', routes.upload.post);

app.get('/track/stream/:id.:type', routes.trackstream.index);

routes.options(app.routes, function(){app.options.apply(app, arguments);});

server.listen(port);


};
