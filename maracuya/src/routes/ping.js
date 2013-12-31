var getIp = require('../util/getMyIp');

function index(req, res) {
    if (req.param.internal) {
        res.send(200);
    } else {
        getIp(function(e, found) {
            if (e) {
                res.send(500);
            }

            var ret = {
                ip: found
            };

            res.send(ret);
        });
    }
}

module.exports = {
    index: index,
};