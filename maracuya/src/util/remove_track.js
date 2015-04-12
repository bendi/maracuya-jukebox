
import trackDao from "../db/dao/TrackDao";

export function removeTrack(path, fn) {
    console.log("PATH: " + path);
    trackDao.removeByPath(path, fn);
}

