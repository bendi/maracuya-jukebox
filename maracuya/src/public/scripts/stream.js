
import $ from 'jquery';
import _ from 'underscore';

import console from 'es6!console';
import player from 'es6!player';
import router from 'es6!mbusRouter';
import playlist from 'es6!playlist';

var stop, play, pause, resume, jump, volume, mute, unmute,
    PROGRES_LENGTH = 260,
    VOLUME_LENGTH = 87,
    startTime = null,
    pauseTime = null,
    currentTrack = null,
    nextTrack = null,
    currVolume = 0.2,
    mBus = router.getRoute("stream");

// should stay empty
function jumpHandler(fn) {
}

var onPlay = _.bind(player.onPlay, player, jumpHandler);

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

function init(data) {
    player.stop();

    playlist.init(mBus);
    // FIXME - playlist id should be fetched from server
    playlist.setCurrentPlaylistId(1);
    return playlist.load()
        .done(function () {
            var firstDisplayed = playlist.displayTracks.apply(playlist, arguments);
            player.updateSongToPlay(firstDisplayed);
        });
}

mBus.addListener("song_selected", function (data) {
    player.updateSongToPlay(data.id);
});

mBus.addListener("play", function (data) {
    play(data.id);
});

mBus.addListener("pause", function () {
    pause();
});
mBus.addListener("resume", function () {
    resume();
});
mBus.addListener("stop", function () {
    stop();
});
mBus.addListener("next", function () {
    stop();
    play(nextTrack.id);
});
mBus.addListener("jump", function (offset) {
    jump(offset);
});
mBus.addListener("volume", function (offset) {
    volume(offset);
});
mBus.addListener("mute", function () {
    mute();
});
mBus.addListener("unmute", function () {
    unmute();
});

// FIXME [mb] duplicate code
mBus.addListener("show_config", function () {
    $(".qrCode").show().one("click", function () {
        $(this).hide();
    });
});

function stopFn(audio) {
    audio.pause();
    audio.currentTime = 0;
    player.stop();
    playlist.stop();
    $("#jukebox header .loadProgress").hide();
}

function pauseFn(audio) {
    audio.pause();
    player.paused();
    pauseTime = new Date();
}

function resumeFn(audio) {
    audio.play();
    currentTrack.playedFor = getPlayedFor(true);
    onPlay(currentTrack, true);
}

function handleJumpFn(audio, offset) {

    var pos = $("#jukebox header .songScrollButton").position();

    console.log(JSON.stringify(pos));

    var progress = (((offset - 15) - pos.left) / PROGRES_LENGTH),
    progressTime = audio.duration * progress;

    console.log("Percent: ", (progress * 100), " time: ", progressTime);

    currentTrack.playedFor += (progressTime * 1000);

    onPlay(currentTrack);

    audio.currentTime += progressTime;
}

function muteFn(audio) {
    audio.muted = true;
    player.mute(!audio.muted);
}


function unMuteFn(audio) {
    audio.muted = false;
    player.mute(!audio.muted);
}

function handleVolumeFn(audio, offset) {
    var percent = Math.round((offset / VOLUME_LENGTH) * 100);
    player.updateVolume(percent);
    currVolume = audio.volume = percent / 100;
}

function playFn(audio, id) {
    var extension = "mp3";
    if (!audio.canPlayType("audio/mpeg")) {
        if (audio.canPlayType("audio/ogg") !== "no") {
            extension = "ogg";
        }
    }
    $.get("/track/" + id)
        .done(function (data) {
            currentTrack = data.current;
            nextTrack = data.next;
            audio.src = "/track/stream/" + id + "." + extension;
        });

    $(audio).off();

    $(audio).one("ended", function (e) {
        // play next track if exists
        // set src of audio to next song
        console.log("Finished");
        if (nextTrack) {
            play(nextTrack.id);
        }
    });

    $(audio).one("canplaythrough", function (e) {
        // now we can start playing
        audio.play();
        audio.volume = currVolume;
        player.updateVolume(currVolume * 100);
        console.log("Loaded " + audio.duration);
    });

    $(audio).one("loadedmetadata", function (e) {
        console.log("Meta: " + audio.duration);
    });

    $(audio).one("playing", function (e) {
        currentTrack.playedFor = 0;
        startTime = new Date();
        onPlay(currentTrack);
    });
}

function timeupdateFn(audio, e) {
    console.log("DUR: " + audio.duration);
    var rem = parseInt(audio.duration - audio.currentTime, 10),
        pos = (audio.currentTime / audio.duration) * 100,
        mins = Math.floor(rem / 60, 10),
        secs = rem - mins * 60;

    console.log("-" + mins + ":" + (secs > 9 ? secs : "0" + secs));
}

function progressFn(audio, e) {

    if (!currentTrack) {
        return;
    }

    var durationTotal = currentTrack.duration;

    var progress = Math.ceil(PROGRES_LENGTH * (audio.buffered.end(0) / durationTotal));

    console.log("Progress called", audio.buffered.end(0), ", ", progress, "px ", durationTotal);

    $("#jukebox header .loadProgress")
        .show()
        .css("clip", "rect(0 " + progress + "px 10px 0)");
}

var m = {
    init: function () {
        $("#jukebox header .loadProgress")
            .show()
            .css("clip", "rect(0 0px 10px 0)");

        var audio = $("audio")[0];

        play = _.partial(playFn, audio);
        stop = _.partial(stopFn, audio);
        pause = _.partial(pauseFn, audio);
        resume = _.partial(resumeFn, audio);
        jump = _.partial(handleJumpFn, audio);
        volume = _.partial(handleVolumeFn, audio);
        mute = _.partial(muteFn, audio);
        unmute = _.partial(unMuteFn, audio);

        //audio.addEventListener("timeupdate", _.throttle(_.partial(timeupdateFn, audio), 1000), false);
        audio.addEventListener("progress", _.partial(progressFn, audio), false);
        audio.addEventListener("loadstart", function (e) {
            console.log("Started loading");
        }, false);
        audio.addEventListener("loadeddata", function (e) {
            console.log("loadeddata");
        }, false);
        audio.addEventListener("canplay", function (e) {
            console.log("canplay");
        });

        init()
            .done(function () {
                mBus.notify("appReady", {paused: false});
            });
    },
    destroy: function () {
        $("#jukebox header .loadProgress").hide();
        stop();
        playlist.destroy();
    }
};

export default m;
