import TrackDao from "../db/dao/TrackDao";
import PlayController from "./playController";

function socketConnected(playController, mBus, socket) {
    function emit() {
        mBus.emit.apply(mBus, arguments);
        socket.emit.apply(socket, arguments);
        socket.broadcast.emit.apply(socket, arguments);
    }
    var play, playNext;

    /**
     * @param msg {String}
     * @param err {Object} Default null
     */
    function error(msg, err) {
        socket.emit("error", msg, err);
    }

    playNext = function (currentId) {
        currentId = currentId || playController.currentId();
        emit("done");
        TrackDao.findNext(currentId)
            .success(play)
            .error(function (err) {
                error("Error when fetching track", err);
            });
    }

    play = function (track) {
        if (!track) {
            console.log("No more tracks in the list.");
            return;
        }
        emit("play", playController.play(track));

        playController
            .removeAllListeners("end")
            .once("end", playNext);
    }

    function playPrev(currentId) {
        currentId = currentId || playController.currentId();
        emit("done");
        TrackDao.findPrev(currentId)
            .success(play)
            .error(function (err) {
                error("Error when fetching track", err);
            });
    }

    socket.emit("connected", {
        currentlyPlaying: playController.getCurrentlyPlaying(),
        playlistId: 1,
        volume: playController.getVolume(),
        mute: playController.isMute
    });

    socket.on("play", function (data) {
        TrackDao.getById(data.id)
            .success(play)
            .error(function (err) {
                error("Error when fetching track", err);
            });
    });

    socket.on("next", function () {
        if (!playController.isPlaying()) {
            return error("Cannot run next when not playing.");
        }
        playNext();
    });

    socket.on("prev", function () {
        if (!playController.isPlaying()) {
            return error("Cannot run prev when not playing.");
        }
        playPrev();
    });

    socket.on("stop", function () {
        try {
            playController.stop();
            emit("stop");
        } catch (e) {
            error(e);
        }
    });

    socket.on("pause", function () {
        try {
            playController.pause();
            emit("pause");
        } catch (e) {
            error(e);
        }
    });

    socket.on("resume", function () {
        try {
            var currentlyPlaying = playController.resume();
            console.log("emitting resume");
            emit("resume", currentlyPlaying);
        } catch (e) {
            error(e);
        }
    });

    socket.on("jump", function (percent) {
        try {
            var jumpSeconds = playController.jump(percent);
            emit("jump", jumpSeconds);
        } catch (e) {
            error(e);
        }
    });

    socket.on("volume", function (percent) {
        playController.volume(percent);
        socket.broadcast.emit("volume", percent);
    });

    socket.on("mute", function () {
        playController.mute();
        emit("mute");
    });

    socket.on("unmute", function () {
        playController.unmute();
        emit("unmute");
    });
}

export default function (io, mBus, standalone) {
    var playController = new PlayController(standalone);

    io.sockets.on("connection", socketConnected.bind(this, playController, mBus));
}
