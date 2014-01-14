var os = require('os'),
    http = require('http');

function getIpsNoLocalhost() {
    var networkInterfaces = os.networkInterfaces();

    var ips = [];

    for ( var i in networkInterfaces) {
        var iface = networkInterfaces[i];
        if (i === 'lo') {
            continue;
        }
        for(var j=0; j < iface.length; j++) {
            if (iface[j].family.toLowerCase() === "ipv4") {
                ips.push(iface[j].address);
                break;
            }
        }
    }

    return ips;
}

function verifyIp(ip, port, fn) {
    http.get('http://' + ip + ':' + port + '/ping/internal', function(res) {
        if (res.statusCode === 200) {
            fn(null, ip);
        } else {
            fn(res);
        }
    }).on('error', fn);
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

var port;

function getIp(fn) {
    if (!port) {
        throw new Error("Port is undefined - cannot read ip.");
    }
    var ips = getIpsNoLocalhost();
    getVerifiedIp(ips, port, fn);
}

getIp.port = function(p) {
    port = p;
};

module.exports = getIp;
