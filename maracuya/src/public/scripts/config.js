var config = {
    playlistPageSize: 20,
    homeUrl: location.protocol + "//" + location.host
};

export default function(key) {
    return config[key];
};

export function init(homeUrl) {
    if (homeUrl) {
        config.homeUrl = homeUrl;
    }
};

