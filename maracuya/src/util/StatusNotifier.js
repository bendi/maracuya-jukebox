import fs from "fs";

function StatusNotifier(path) {
    this.path = path;
}

StatusNotifier.prototype.updateStatus = function (status) {
    fs.writeFileSync(this.path, "status: " + status);
};

export default function (path) {
    return new StatusNotifier(path);
};