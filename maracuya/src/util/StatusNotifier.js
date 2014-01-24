var fs = require("fs");

function StatusNotifier(path) {
    this.path = path;
}

StatusNotifier.prototype.updateStatus = function (status) {
    fs.writeFileSync(this.path, "status: " + status);
};

module.exports = function (path) {
    return new StatusNotifier(path);
};