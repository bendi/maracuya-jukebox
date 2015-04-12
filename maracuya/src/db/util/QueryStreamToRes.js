//Set both readable and writable in constructor.
function QueryStreamToRes(collection) {
    this.readable = true;
    this.writable = true;
    this.first = true;
    if (collection) {
        this._handleFirst = function (doc) {
            if (this.first) {
                doc = "[" + doc;
                this.first = false;
            } else {
                doc = "," + doc;
            }
            return doc;
        };
        this._handleLast = function () {
            if (this.first) {
                this.emit("data", "[");
                this.first = false;
            }
            this.emit("data", "]");
        };
    } else {
        this._handleFirst = this._handleLast = function (doc) {
            return doc;
        };
    }
}

// Inherit from base stream class.
require("util").inherits(QueryStreamToRes, require("stream"));

// Extract args to `write` and emit as `data` event.
QueryStreamToRes.prototype.write = function (doc) {
    if (doc) {
        doc = JSON.stringify(doc);
        doc = this._handleFirst(doc);
    }
    this.emit("data", doc);
};

// Extract args to `end` and emit as `end` event.
QueryStreamToRes.prototype.end = function () {
    this._handleLast();
    this.emit("end");
};

export default QueryStreamToRes;
