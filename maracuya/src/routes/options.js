

module.exports = function (routes, optionsFn) {
    optionsFn("/", function (req, res) {
        res.contentType("application/json");

        res.send(routes);
    });
};