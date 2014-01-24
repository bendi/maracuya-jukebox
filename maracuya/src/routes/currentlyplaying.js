var TrackDao = require("../db/dao/TrackDao"),
    currentTrackId;

/**
 *
 * @param req
 * @param res
 * @queryparam pageSize Number
 * @method GET
 * @res {page:page, items: [], pageSize: pageSize, total: total}
 * @contentType application/json
 *
 */
function index(req, res) {
    res.contentType("application/json");

    var pageSize = parseInt(req.param("pageSize"), 10);
    console.log("Pagesize: ", pageSize, ", current: ", currentTrackId);

    if (!currentTrackId) {
        res.send(404, {msg: "Not playing!"});
        return;
    }

    TrackDao.getCurrentlyPlaying(currentTrackId, pageSize, function (err, data) {
        if (err) {
            console.log(err);
            res.send(500, {msg: "Error when fetching records"});
            return;
        }

        res.send(data);
    });

}

module.exports = {
    /**
     *
     * @param p
     * @param p.mBus
     */
    init: function (p) {
        var mBus = p.mBus;

        mBus.on("play", function (currentTrack) {
            currentTrackId = currentTrack.id;
        });
        mBus.on("stop", function () {
            currentTrackId = null;
        });
    },
    index: index
};