#!/usr/bin/env node

var myArgs = require("optimist")
    .usage("Node jukebox - usage: \n node run.js - to start server mode \n node run.js - insert [file to insert]")
    .alias("d", "datadir")
    .describe("d", "application data directory")
    .alias("s", "status")
    .describe("s", "path to status file")
    .default("s", "status.txt")
    .argv,
    appDir = require("./util/appDir").init(myArgs.d),
    db = require("./db/db")({
        appDir: appDir()
    }),
    model = require("./db/model"),
    app = require("./modules/app"),
    insert = require("./modules/insert"),
    remove = require("./modules/remove"),
    grace = require("grace"),
    statusNotifier = require("./util/StatusNotifier")(myArgs.s);

// using grace module for handling
// cross-platform CTRL + C
var graceApp = grace.create(),
    stdin = process.stdin;

graceApp.on("error", function (err) {
    console.error(err);
});

graceApp.on("start", function () {

    statusNotifier.updateStatus("starting");

    model.init(db);

    db.sync().on("error", function () {
        console.error("Error creating db!");
        graceApp.shutdown(1);
    });

    var pathToFile;
    switch (myArgs._[0]) {
    case "insert":
        pathToFile = myArgs._[1];
        if (!pathToFile) {
            console.log("Path to file not specified");
        } else {
            console.log("Running insert mode.");
            insert = insert(db, model);
            insert(pathToFile);
        }
        break;
    case "remove":
        pathToFile = myArgs._[1];
        if (!pathToFile) {
            console.log("Path to file not specified");
        } else {
            console.log("Running remove mode.");
            remove = remove(db, model);
            remove(pathToFile);
        }
        break;
    case "server":
        /* falls through */
    default:
        console.log("Running http server mode.");
        app(db, model);
        break;
    }

    statusNotifier.updateStatus("running");

    stdin.resume();
    stdin.setEncoding("utf8");
    stdin.on("data", function (line) {
        console.log("line: " + line);
        line = line.replace(/^\s*|\s*$/g, "");
        if (line === "stop") {
            graceApp.shutdown(0);
        }
    });
});

graceApp.on("shutdown", function (cb) {
    console.log("shutting down");
    statusNotifier.updateStatus("closing");
    cb();
});

graceApp.on("exit", function (code) {
    console.log("bye (" + code + ")");
    statusNotifier.updateStatus("closed");
});

graceApp.timeout(1000, function () {
    //The shutdown event never hangs up so this code never executes
    console.error("timed out, forcing shutdown");
});

graceApp.start();


