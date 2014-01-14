define(function() {

    var config = {
        playlistPageSize: 20,
        homeUrl: location.protocol + '//' + location.host
    };

    function get(key) {
        return config[key];
    }

    get.init = function(homeUrl) {
        if (homeUrl) {
            config.homeUrl = homeUrl;
        }
    };

    return get;
});