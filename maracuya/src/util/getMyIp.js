var os = require("os"),
    http = require("http");

function getIpsNoLocalhost() {
    var networkInterfaces = os.networkInterfaces();

    var ips = [];

    for (var i in networkInterfaces) {
        var iface = networkInterfaces[i];
        if (i === "lo") {
            continue;
        }
        ips = ips.concat(getIfaceIps(iface));
    }

    return ips;
}

function getIfaceIps(iface) {
    var ips = [];
    for (var j = 0; j < iface.length; j++) {
        var alias = iface[j];
        if (alias.family === "IPv4" && alias.address !== "127.0.0.1" && !alias.internal) {
            ips.push(alias.address);
        }
    }
    return ips;
}

var port;

function getIp() {
    if (!port) {
        throw new Error("Port is undefined - cannot read ip.");
    }
    return getIpsNoLocalhost();
}

getIp.port = function (p) {
    port = p;
};

module.exports = getIp;
