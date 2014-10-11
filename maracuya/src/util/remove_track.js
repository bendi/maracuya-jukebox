
var trackDao = require("../db/dao/TrackDao");

function removeTrack(path, fn) {
    console.log("PATH: " + path);
    trackDao.removeByPath(path, fn);
}

module.exports = {
    removeTrack: removeTrack
};