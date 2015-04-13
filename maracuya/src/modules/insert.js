import {insertTrack as insert} from "../util/insert_track";

//
// Track.remove({}, function (err) {
//
// if (err) {
// console.log(err);
// } else {
// console.log("Removed!");
// }
//
// process.exit();
// });
//
// return;

export default function (db, model) {
    return function (path) {
        insert(path, function (err) {
            if (err) {
                throw err;
            }
        });
    };
}
