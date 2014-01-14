function updateStatus(s) {
    document.querySelector('#status').innerHTML = s;
}

onload = function() {

    var path = require('path');

    var processDir = path.join(process.execPath.split(path.sep).slice(0, -1)
            .join(path.sep), 'data');

    var appDir = require('../util/appDir'),
        appDir = appDir.init(processDir),
        db = require('../db/db')({
            appDir : appDir()
        }),
        model = require('../db/model'),
        app = require('../modules/app');

    updateStatus('starting');

    model.init(db);

    db.sync();

    console.log("Running http server mode.");
    app(db, model);

    updateStatus('running');

    setTimeout(function() {
        window.frames.vj.location = '../public/index.html';
    }, 1000);
};