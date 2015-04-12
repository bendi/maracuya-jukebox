
function QueryToQueryStream(data) {
    var self = this;
    setTimeout(function () {
        for (var i = 0; i < data.length; i++) {
            var obj = data[i];
            self.emit("data", obj.lean && obj.lean() || obj);
        }

        self.emit("end");
    }, 1);
}

// Inherit from base stream class.
require("util").inherits(QueryToQueryStream, require("stream"));

export default QueryToQueryStream;
