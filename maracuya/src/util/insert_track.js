import trackDao from "../db/dao/TrackDao";
import fs from "fs";
import mp3info from "mp3info";
import ID3 from "id3";

export function doInsert(path, title, fn) {
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

            fn();
        });

    });
}

export function insertTrack(path, title, fn) {
    if (typeof title === "function") {
        fn = title;
        title = "";
    }
    console.log("PATH: " + path);

    trackDao.findByPath(path)
        .success(function (data) {
            if (data) {
                fn(null);
            } else {
                doInsert(path, title, fn);
            }
        })
        .error(fn);
}

