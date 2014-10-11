var remove = require("../util/remove_track").removeTrack;

module.exports = function (db, model) {
    return function (path) {
        remove(path, function (err) {
            if (err) {
                throw err;
            }

            process.exit();
        });
    };
};