
var trackDao = require("../db/dao/TrackDao"),
    fs = require("fs"),
    mp3info = require("mp3info"),
    ID3 = require("id3");

function insertTrack(path, title, fn) {
    if (typeof(title) === "function") {
        fn = title;
        title = "";
    }
    console.log("PATH: " + path);

    mp3info(path, function (error, data) {
        if (error) {
            return fn(error);
        }

        var id3 = new ID3(fs.readFileSync(path));
        id3.parse();

        var mp3data = {
            duration: Math.round(data.length),
            title: id3.get("title") || title,
            artist: id3.get("artist"),
            album: id3.get("album"),
            path: fs.realpathSync(path)
        };

        trackDao.create(mp3data, function (err) {
            if (err) {
                return fn(err);
            }

            console.log("Created: " + JSON.stringify(mp3data));

            fn();
        });

    });
}

module.exports = {
    insertTrack: insertTrack
};