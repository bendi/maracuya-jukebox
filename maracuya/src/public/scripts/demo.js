define([
    "jquery",
    "underscore",
    "console",
    "config",
    "player",
    "mbusRouter",
    "eventHandler",
    "playlist"
], function ($, _, console, config, player, router, eh, playlist) {

    var mBus = router.getRoute("demo"),
        startTime,
        pauseTime,
        currentTrack;

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
        currentTrack = {
            title: "Scorptions - send me an angel",
            duration: 230,
            playedFor: 0,
            paused: false,
        };
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


    return {
        init: function () {
            playlist.init(mBus);

            return this;
        },
        destroy: function () {}
    };
});