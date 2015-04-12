import TrackDao from "../db/dao/TrackDao";
import QueryStreamToRes from "../db/util/QueryStreamToRes";
import PagedRes from "../util/PagedRes";

/**
 *
 * @param req
 * @param res
 * @urlparam id Number
 * @queryparam pageSize Number
 * @queryparam page Number (where 1 - means first page)
 * @method GET
 * @contentType application/json; charset=utf-8
 *
 */
function index(req, res) {
    res.contentType("application/json; charset=utf-8");

    var playlistId = req.params.id,
        pageSize = req.param("pageSize"),
        page = req.param("page") || 0,
        offset = page * pageSize;

    // TODO validate query params

    TrackDao.findWithLimit(pageSize, offset, function (err, total, stream) {
        if (err) {
            res.send(500, {msg: "Error when fetching tracks."});
            return;
        }

        stream
            .pipe(new QueryStreamToRes(true))
            .pipe(new PagedRes(total, pageSize, page))
            .pipe(res);

    });
}

function update(req, res) {

}

export default {
    index: index,
    update: update
};