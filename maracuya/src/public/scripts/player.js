define([
    'underscore',
    'console',
    'common',
    'playlist'
],
function(_, console, common, playlist) {

    var PROGRES_LENGTH = 260,
        VOLUME_LENGTH = 87,
        VOLUME_OFFSET_LEFT = 195;

    function Player(){}

    Player.prototype.setDuration = function(played, elapsed, paused) {
        var seconds = $('#jukebox header .duration').data('elapsed') ? elapsed : played;
        $('#jukebox header .duration').html(seconds === undefined ? '' : common.dateToMinutes(seconds));
        $('#jukebox header .duration').removeClass('blink');
        $('#jukebox header .statusIndicator').removeClass('play pause');
        if (seconds !== undefined) {
            $('#jukebox header .duration').addClass(paused ? 'blink' : '');
            $('#jukebox header .statusIndicator').addClass(paused ? 'pause' : 'play');
        }
    };

    Player.prototype.updateProgress = function(duration, total) {
        var progress = 0;
        if (duration > 0) {
            progress = (duration/total);
        }
        progress = Math.ceil(PROGRES_LENGTH*progress);
        $('#jukebox header .songProgress').css('clip', 'rect(0 '+progress+'px 10px 0)');
        var scrollPos = 5;
        if (progress > 230) {
            scrollPos = 230;
        } else if (progress > 5) {
            scrollPos = progress;
        }
        $('#jukebox header .songScrollButton').css('left', scrollPos + 'px');
    };

    Player.prototype.resetProgress = function() {
        $('#jukebox header .songProgress').css('clip', 'rect(0 0px 10px 0)');
        $('#jukebox header .songScrollButton').css('left', 5 + 'px');
    };

    Player.prototype.updateVolume = function(percent) {
        var volLen = (percent/100) * VOLUME_LENGTH;
        $('#jukebox header .volumeIndicator').css('clip', 'rect(0 '+volLen+'px 10px 0)');

        if (percent > 85) {
            percent = 85;
        } else if (percent < 5) {
            percent = 5;
        }
        // scroll offset + value - part of the width + (the rest)
        var scrollPos = VOLUME_OFFSET_LEFT - 15 + (percent/100) * VOLUME_LENGTH;
        $('#jukebox header .volumeButton').css('left', scrollPos + 'px');
    };


    Player.prototype.mute = function(on) {
        var $this = $('#jukebox header .muteButton');
        if (on) {
            // off
            $this.removeClass('muteOn');
        } else {
            // on
            $this.addClass('muteOn');
        }
    };

    Player.prototype.stop = function() {
        $('#jukebox header .title').html('');
        this.stopProgress();
        this.setDuration();
        this.resetProgress();
        $('#jukebox header .playButtons').attr('class', 'playButtons').addClass('stop');
        $('#jukebox header .title').attr('class', 'title');
    };

    Player.prototype.stopProgress = function() {
        if (this.interval) {
            this.interval = clearInterval(this.interval);
        }
    };

    Player.prototype.paused = function() {
        this._paused = true;
        $('#jukebox header .duration').addClass('blink');
        $('#jukebox header .statusIndicator').removeClass('play').addClass('pause');
        $('#jukebox header .playButtons').attr('class', 'playButtons').addClass('paused');

        this.stopProgress();
    };


    Player.prototype.updateSongToPlay = function(id) {
        $('#jukebox span[data-action="play"]').data('id', id);
    };

    Player.prototype.onPlay = function(jumpHandler, track, resumed) {
        if (this._doneTimeout) {
            this._doneTimeout = clearTimeout(this._doneTimeout);
        }
        this.stop();

        console.log("Playing: " + JSON.stringify(track));

        playlist.updateCurrentTrack(track.id);
        this.updateSongToPlay(track.id);

        if (!resumed) {
            this.resetProgress();
        }

        $('#jukebox header .title').html(common.title(track));

        var startTime = new Date().getTime() - track.playedFor;
        var played = track.playedFor/1000;

        played = Math.ceil(played < 0 ? 0 : played);

        var elapsed = Math.floor(track.duration - played);

        console.log("Time left: " + elapsed, ", played: " + played);

        this._paused = track.paused;
        this.setDuration(played, elapsed, this._paused);
        this.updateProgress(played, track.duration);
        if (this._paused) {
            $('#jukebox header .playButtons').attr('class', 'playButtons').addClass('paused');
            return;
        }
        $('#jukebox header .playButtons').attr('class', 'playButtons').addClass('play');
        $('#jukebox header .title').attr('class', 'title').addClass('play');

        jumpHandler(function(jumpSeconds) {
            console.log("Jumping: " + jumpSeconds);
            startTime -= jumpSeconds*1000;
        });

        var that = this;
        this.interval = setInterval(function() {
            played = Math.ceil((new Date().getTime() - startTime)/1000);
            elapsed = track.duration - played;

            console.log("played: ", played);

            that.setDuration(played, elapsed);
            that.updateProgress(played, track.duration);
            if (elapsed <= 0) {
                that.stop();
            }
        }, 1000);
    };

    Player.prototype.done = function() {
        this.stopProgress();
        $('#jukebox header .title').attr('class', 'title');
        this._doneTimeout = setTimeout(_.bind(function() {
            this.setDuration(0);
            this.stop();
            this.resetProgress();
            console.log("finished playing!");
        }, this), 100);
    };

    return new Player();
});
