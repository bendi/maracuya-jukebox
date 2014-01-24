var getIp = require("../util/getMyIp"),
    port;

function index(req, res) {
    var ips = getIp();
    res.send({
        ips: ips,
        port: port
    });
}

module.exports = {
    index: index,
    init: function (p) {
        port = p;
    }
};
