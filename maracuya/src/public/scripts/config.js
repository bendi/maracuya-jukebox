define(function() {

    var config = {
        playlistPageSize: 20,
        homeUrl: location.protocol + '//' + location.host
    };

    return function(key) {
        return config[key];
    };

});