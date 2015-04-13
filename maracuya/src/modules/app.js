
import {join} from "path";
import express from "express";
import cors from "cors";
import SocketIOServer from "socket.io";
import {EventEmitter} from "events";
import sockets from "../util/sockets";
import appDir from "../util/appDir";
import getIp from "../util/getMyIp";
import routes from "../routes";


var app = express(),
    mBus = new EventEmitter(),
    port = process.env.PORT || 8280,
    epaper;

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

export default function (model, db, standalone) {
    if (!standalone) {
        epaper = require("../util/runEpaper.js");
    }

    var server = require("http").createServer(app),
        io = new SocketIOServer(server, {
            "log level": 1,
            "transports": ["flashsocket", "websocket", "polling"],
            "polling duration": 2
        });

    getIp.port(port);

    sockets(io, mBus, standalone);

    app.configure(function () {
        app.set("port", port);
        app.use(express.logger("dev"));
        app.use(express.compress());
        app.use(express.bodyParser());
        app.use(express.cookieParser());
        app.use(cors());
        app.use(app.router);
        app.use(express.static(join(__dirname, "/../public")));
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
    if (epaper) {
        epaper(port);
    }
}
