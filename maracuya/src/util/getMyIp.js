var os = require('os'),
    http = require('http');

function getIpsNoLocalhost() {
    var networkInterfaces = os.networkInterfaces();

    var ips = [];

    for ( var i in networkInterfaces) {
        var iface = networkInterfaces[i];
        if (i === 'lo')
            continue;
        ips.push(iface[0].address);
    }

    return ips;
}

function getVerifiedIp(ips, port, fn) {
    function verify(e, ip) {
        if (e) {
            if (ips.length) {
                verifyIp(ips.pop(), port, verify);
            }
        } else {
            fn(null, ip);
            fn = null;
        }

        if (fn) {
            fn('Valid ip not found');
        }

    }

    verifyIp(ips.pop(), port, verify);
}

function verifyIp(ip, port, fn) {
    http.get('http://' + ip + ':' + port + '/ping', function(res) {
        if (res.statusCode === 200) {
            fn(null, ip);
        } else {
            fn(res);
        }
    }).on('error', fn);
}

function getIp(port, fn) {
    var ips = getIpsNoLocalhost();
    getVerifiedIp(ips, port, fn);
}

module.exports = getIp;