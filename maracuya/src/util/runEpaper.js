var getIp = require("../util/getMyIp"),
    exec = require('child_process').exec;

function run(port) {
    var ips = getIp(),
        out = [];
    ips.forEach(function (ip) {
        out.push("http://" + ip + ":" + port);
    });

    exec(____dirname + "../../../epaper/epaper.js '" + out.join() + "'", function (e, stdout, stdin) {
        if (e) {
            console.log(e);
        }
    });
}

module.exports = run;
