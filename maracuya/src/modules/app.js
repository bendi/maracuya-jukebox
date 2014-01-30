var express = require("express"),
    app = express(),
    cors = require("cors"),
    socketio = require("socket.io"),
    EventEmitter = require("events").EventEmitter,
    mBus = new EventEmitter(),
    sockets = require("../util/sockets"),
    appDir = require("../util/appDir"),
    getIp = require("../util/getMyIp"),
    routes = require("../routes"),
    port = process.env.PORT || 8280,
    epaper = require("../util/runEpaper.js");

function logErrors(err, req, res, next) {
    console.error(err.stack);
    next(err);
}

function clientErrorHandler(err, req, res, next) {
    if (req.xhr) {
        res.send(500, { error: "Something blew up!" });
    } else {
        next(err);
    }
}

module.exports = function (model, db, standalone) {
    var server = require("http").createServer(app),
        io = socketio.listen(server);

    io.configure(function () {
        io.set("log level", 1);
        io.set("transports", ["flashsocket", "websocket", "xhr-polling"]);
        io.set("polling duration", 2);
    });

    getIp.port(port);

    sockets(io, mBus, standalone);

    app.configure(function () {
        app.set("port", port);
        app.use(express.logger("dev"));
        app.use(express.bodyParser());
        app.use(express.cookieParser());
        app.use(cors());
        app.use(app.router);
        app.use(express.static(__dirname + "/../public"));
        app.use(logErrors);
        app.use(clientErrorHandler);
    });

    var initParams = {
        mBus: mBus,
        musicDir: appDir("music")
    };

    routes.currentlyplaying.init(initParams);
    routes.upload.init(initParams);
    routes.ping.init(port);

    app.get("/playlist/:id", routes.playlist.index);

    app.get("/track/:id", routes.track.index);
    app.post("/track/:id", routes.track.update);

    app.get("/currentlyplaying", routes.currentlyplaying.index);
    app.get("/searchtracks", routes.searchtracks.index);

    app.post("/upload", routes.upload.post);

    app.get("/track/stream/:id.:type", routes.trackstream.index);

    app.get("/ping", routes.ping.index);
    app.get("/ping/:internal", routes.ping.index);

    routes.options(app.routes, function () {
        app.options.apply(app, arguments);
    });

    server.listen(port);

    // quick hack - start epaper script
    epaper(port);
};
