import appDir from "../util/appDir";

var currentlyPlaying,
    startTime,
    pauseTime,
    // set default volume to 10 (in percent)
    volume = 10;

function CurrentTrack(track) {
    this.duration = track.duration;
    this.elapsed = track.duration;
    this.title = track.title;
    this.artist = track.artist;
    this.album = track.album;
    this.path = track.path;
    this.id = track.id;
    this.playedFor = 0;
}

function getPlayedFor(resume) {
    var pausedFor = pauseTime ? new Date().getTime() - pauseTime.getTime() : 0;
    var offset = startTime ? new Date(startTime.getTime() + pausedFor).getTime() : 0;
    if (resume) {
        startTime = new Date(offset);
    }
    console.log("pausedFor: ", pausedFor, ", offset: ", offset, ", startTime: ", startTime);
    if (offset > 0) {
        return new Date().getTime() - offset;
    }
    return 0;
}

function songFinished(data) {
    var currentId = currentlyPlaying.id;
    currentlyPlaying = null;
    startTime = null;
    pauseTime = null;
    this.emit("end", currentId);
}

function PlayController(standalone) {
    var Player;
    if (standalone) {
        Player = require("./Player");
    } else {
        Player = require("./PlayerParent");
    }
    this.player = new Player();
    this.isMute = false;
    this.standalone = standalone;
}

require("util").inherits(PlayController, require("events").EventEmitter);

PlayController.prototype.stop = function () {
    currentlyPlaying = null;
    startTime = null;
    this.player.removeAllListeners("end");
    this.player.removeAllListeners("error");
    this.player.stop();
};

PlayController.prototype.play = function (track) {
    currentlyPlaying = new CurrentTrack(track);

    pauseTime = null;
    startTime = new Date();

    var that = this;
    this.player.removeAllListeners("end");
    this.player.removeAllListeners("error");
    this.player.once("end", songFinished.bind(that));
    this.player.once("error", function (data) {
        console.log("ERROR: error when playing song, ", data);
        songFinished.call(that);
    });

    if (!this.isMute) {
        this.player.volume(volume);
    } else {
        this.player.volume(0);
    }
    var trackPath = track.path;
    if (this.standalone) {
        trackPath = appDir(trackPath);
    }
    console.log(trackPath);
    this.player.play(trackPath);

    return currentlyPlaying;
};

PlayController.prototype.isPlaying = function () {
    return currentlyPlaying ? true : false;
};

PlayController.prototype.currentId = function () {
    if (this.isPlaying()) {
        return currentlyPlaying.id;
    }
    return null;
};

PlayController.prototype.getCurrentlyPlaying = function () {
    if (currentlyPlaying) {
        currentlyPlaying.playedFor = getPlayedFor();
    }

    return currentlyPlaying;
};

PlayController.prototype.pause = function () {
    if (!currentlyPlaying) {
        throw "Cannot pause when not playing.";
    }
    pauseTime = new Date();
    currentlyPlaying.paused = true;
    this.player.pause();
};

PlayController.prototype.resume = function () {
    var paused = false;
    if (currentlyPlaying) {
        paused = currentlyPlaying.paused;
        currentlyPlaying.paused = false;
    }
    if (!pauseTime || !paused) {
        pauseTime = null;
        throw "Cannot resume when not paused.";
    }
    currentlyPlaying.playedFor = getPlayedFor(true);

    this.player.pause();
    pauseTime = null;
    return currentlyPlaying;
};

PlayController.prototype.jump = function (percent) {
    if (!currentlyPlaying) {
        throw "Cannot jump when not playing.";
    }
    var jumpSeconds = Math.round(currentlyPlaying.duration * (percent / 100));
    console.log("JUMP: ", jumpSeconds, ", percent: ", percent, "%");
    this.player.jump(jumpSeconds);
    var s = startTime;
    startTime = new Date(startTime.getTime() - (jumpSeconds * 1000));
    console.log("Starttime: ", s, ", ", startTime);
    return jumpSeconds;
};

PlayController.prototype.mute = function () {
    this.isMute = true;
    this.player.volume(0);
};

PlayController.prototype.unmute = function () {
    this.isMute = false;
    this.player.volume(volume);
};

PlayController.prototype.volume = function (volume_) {
    volume = volume_;
    this.player.volume(volume);
    return volume;
};

PlayController.prototype.getVolume = function () {
    return volume;
};

export default PlayController;

