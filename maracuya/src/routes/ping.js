var getIp = require('../util/getMyIp'),
    port;

function index(req, res) {
    if (req.params.internal) {
        res.send(200);
    } else {
        getIp(function(e, found) {
            if (e) {
                res.send(500);
            }

            var ret = {
                ip: found,
                url: "http://" + found + (port ? ":" + port : "")
            };

            res.send(ret);
        });
    }
}

module.exports = {
    index: index,
    init: function(p) {
        port = p;
    }
};
