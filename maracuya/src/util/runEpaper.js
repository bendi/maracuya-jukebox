import getIp from "../util/getMyIp";
import {spawn as exec} from "child_process";

export default function run(port) {
    var ips = getIp(),
        out = [];
    ips.forEach(function (ip) {
        out.push("http://" + ip + ":" + port);
    });
    var child = exec(__dirname + "/../../../epaper/epaper.js", [out.join()]);

    child.stderr.on("data", function (data) {
        console.log("" + data);
    });

    child.stdout.on("data", function (data) {
        console.log("" + data);
    });

}

