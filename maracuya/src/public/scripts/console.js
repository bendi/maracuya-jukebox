
var c;
if (typeof console === "undefined") {
    c = {
        log: function () {}
    };
} else {
    c = console;
}

export default c;
