
//Set both readable and writable in constructor.
function PagedRes(total, pageSize, page) {
    this.readable = true;
    this.writable = true;
    this.first = true;
    this.total = total;
    this.pageSize = pageSize;
    this.page = page;
}

//Inherit from base stream class.
require("util").inherits(PagedRes, require("stream"));

PagedRes.prototype._handleFirst = function (elem) {
    if (this.first) {
        elem = "{\"total\":" + this.total + ", \"pageSize\": " + this.pageSize + ",\"page\":" + this.page + ",\"items\":" + elem;
        this.first = false;
    }
    return elem;
};

PagedRes.prototype._handleLast = function () {
    this.emit("data", "}");
};

// Extract args to `write` and emit as `data` event.
PagedRes.prototype.write = function (elem) {
    if (elem) {
        elem = this._handleFirst(elem);
    }
    this.emit("data", elem);
};

// Extract args to `end` and emit as `end` event.
PagedRes.prototype.end = function () {
    this._handleLast();
    this.emit("end");
};

export default PagedRes;
