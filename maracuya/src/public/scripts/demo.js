
import $ from "jquery";
import _ from "underscore";

import console from "es6!console";
import config from "es6!config";
import player from "es6!player";
import router from "es6!mbusRouter";
import eh from "es6!eventHandler";
import playlist from "es6!playlist";

var mBus = router.getRoute("demo"),
    startTime,
    pauseTime,
    currentTrack,
	tracks = [{
        title: "Scorpions - send me an angel",
        duration: 230,
        playedFor: 0,
        paused: false,
		id: 1
    },
	{
        title: "Blur - Song2",
        duration: 250,
        playedFor: 0,
        paused: false,
		id: 2
    }];

// should stay empty
function jumpHandler(fn) {
}

function getPlayedFor(resumed) {
    var pausedFor = pauseTime ? new Date().getTime() - pauseTime.getTime() : 0;
    var offset = startTime ? new Date(startTime.getTime() + pausedFor).getTime() : 0;
    if (resumed) {
        startTime = new Date(offset);
    }
    console.log("pausedFor: ", pausedFor, ", offset: ", offset, ", startTime: ", startTime);
    if (offset > 0) {
        return new Date().getTime() - offset;
    }
    return 0;
}

var onPlay = _.bind(player.onPlay, player, jumpHandler);

mBus.addListener("play", function (data) {
    startTime = new Date();
    currentTrack = tracks[Math.min(tracks.length - 1, (data.id || 1) - 1)];
    onPlay(currentTrack, true);
});

mBus.addListener("stop", function () {
    player.stop();
    playlist.stop();
});

mBus.addListener("pause", function () {
    player.paused();
    pauseTime = new Date();
});

mBus.addListener("resume", function () {
    currentTrack.playedFor = getPlayedFor(true);
    onPlay(currentTrack, true);
});


var m = {
    init: function () {
        playlist.init(mBus);

        return this;
    },
    destroy: function () {}
};

export default m;
