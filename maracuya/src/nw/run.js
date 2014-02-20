function updateStatus(s) {
    document.querySelector("#status").innerHTML = s;
}

onload = function () {

    var path = require("path"),
        os = require("os");

    var processDir = process.execPath.split(path.sep).slice(0, -1)
            .join(path.sep);
            
    if (os.platform() === "darwin") {
        processDir = process.cwd();
    }

    var appDir = require("../util/appDir").init(processDir),
        db = require("../db/db")({
            appDir : appDir("data")
        }),
        model = require("../db/model"),
        app = require("../modules/app");

    updateStatus("starting");

    model.init(db);

    db.sync();

    console.log("Running http server mode.");
    app(db, model, true);

    updateStatus("running");

    setTimeout(function () {
        window.frames.vj.location = "../public/index.html";
    }, 1000);
};