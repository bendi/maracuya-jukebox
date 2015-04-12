import fs from "fs";
import {insertTrack as insert} from "../util/insert_track";

var targetDir;

function handleFile(file, next) {
    console.log(file, ", targetDir: ", targetDir, ", currentdir: " + process.cwd());
    next = next || function () {};
    try {
        var targetPath = targetDir + "/" + file.name;
        fs.rename(file.path, targetPath, function (err) {
            if (err) {
                console.log(err);
                next();
            } else {
                insert(targetPath, function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Track added: " + targetPath);
                    }
                    next();
                });
            }
        });
    } catch (e) {
        next();
        console.log(e);
    }
}

function getHandleFile(file, next) {
    return function () {
        setTimeout(function () {
            handleFile(file, next);
        }, 1);
    };
}

/**
 *
 * @param req
 * @param res
 *
 * @method POST
 * @httperrors 400 - in case files array is empty
 * @contentType application/json
 *
 */
function post(req, res) {
    res.contentType("application/json");

    var files = req.files;
    //console.log(files);

    if (!files) {
        console.log("Files not sent");
        res.send({msg: "Files list empty"}, 400);
        return;
    }

    var run = function () {
        res.send({});
    };

    for (var i in files) {
        run = getHandleFile(files[i], run);
    }

    run();
}

export default {
    /**
     *
     * @param p
     * @param p.musicDir
     */
    init: function (p) {
        targetDir = p.musicDir;
    },
    post: post
};