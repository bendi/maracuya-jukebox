var getIp = require('../util/getMyIp'),
    ip = '';

getIp(function(e, found) {
    ip = found;
});

function index(req, res) {
    var ret = {
        ip: ip
    };

    res.send(ret);
}

module.exports = {
    index: index,
};