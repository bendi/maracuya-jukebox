var getIp = require("../util/getMyIp"),
    exec = require('child_process').spawn;

function run(port) {
    var ips = getIp(),
        out = [];
    ips.forEach(function (ip) {
        out.push("http://" + ip + ":" + port);
    });
console.log("Found ips", out);
    var child = exec(__dirname + "/../../../epaper/epaper.sh", [out.join()]);

child.stderr.on('data', function (data) {
console.log('' + data);
});

child.stdout.on('data', function (data) {
  console.log('' + data);
});

}

module.exports = run;
