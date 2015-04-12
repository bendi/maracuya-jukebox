import {removeTrack as remove} from "../util/remove_track";

export default function (db, model) {
    return function (path) {
        remove(path, function (err) {
            if (err) {
                throw err;
            }

            process.exit();
        });
    };
};