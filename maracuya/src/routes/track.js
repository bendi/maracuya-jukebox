import TrackDao from "../db/dao/TrackDao";

/**
 *
 * @param req
 * @param res
 *
 * @urlparam id Number
 * @method GET
 * @return {current: Track, next: Track}
 * @contentType application/json
 *
 */
function index(req, res) {
    res.contentType("application/json");

    var id = req.params.id;

    TrackDao.withNext(id, function (err, data) {
        if (err) {
            console.log(err);
            return res.send(500, {msg: "Error when fetching tracks."});
        }

        if (!data) {
            console.log("Data for id not found, id: " + id);
            return res.send(404);
        }

        res.send(200, data);
    });
}

/**
*
* @param req
* @param res
*
* @urlparam id Number
*
* @queryparam artist
* @queryparam album
* @queryparam title
*
* @method POST
* @contentType application/json
*
*/
function update(req, res) {
    res.contentType("application/json");

    var id = req.params.id;

    var data = {};

    console.log(req.query, req.params, req.body);

    var i = 0, params = ["artist", "album", "title"];
    for (i = 0; i < params.length; i++) {
        if (req.body[params[i]]) {
            data[params[i]] = req.body[params[i]];
        }
    }

    if (!i) {
        res.send({msg: "Misssing param"}, 400);
    }

    console.log("Data: ", data, ", id: ", id);

    TrackDao.updateById(id, data, function (err, numberAffected) {
        if (!err) {
            res.send({});
        } else {
            console.log("Error when updating record.", id, data);
            res.send(500, {msg: "Error when updating record."});
        }
    });
}

export default {
    index: index,
    update: update
};
