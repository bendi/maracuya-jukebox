import getIp from "../util/getMyIp";

var port;

function index(req, res) {
    var ips = getIp();
    res.send({
        ips: ips,
        port: port
    });
}

export default {
    index: index,
    init: function (p) {
        port = p;
    }
};
