var TrackDao = require('../db/dao/TrackDao'),
    QueryStreamToRes = require('../db/util/QueryStreamToRes'),
    PagedRes = require('../util/PagedRes');

/**
 *
 * @param req
 * @param res
 *
 * @queryparam txt
 * @queryparam pageSize Number
 * @queryparam page Number (where 1 - means first page)
 *
 * @method GET
 * @contentType application/json
 *
 */
function index(req, res) {
    res.contentType('application/json');

    var txt = req.param('txt'),
        pageSize = parseInt(req.param('pageSize'), 10),
        page = req.params.page ? parseInt(req.param('page'), 10) : 1;

    console.log("PageSize: " + pageSize + ", param: " + req.params.pageSize);

    TrackDao.search(txt, (page-1) * pageSize, pageSize, function(err, total, stream) {
        if (err) {
            res.send(500, {msg: "Error when searching track."});
            return;
        }
        stream
            .pipe(new QueryStreamToRes(true))
            .pipe(new PagedRes(total, pageSize, page))
            .pipe(res);
    });

}

module.exports = {
    index: index
};