define([
    'jquery',
    'underscore',
    'console',
    'io',
    'player',
    'mediaLibrary',
    'mbusRouter',
    'playlist'
], function($, _, console, io, player, mediaLibrary, router, playlist) {

    // FIXME - should be moved into common
    var PROGRES_LENGTH = 260,
        VOLUME_LENGTH = 87,
        VOLUME_OFFSET_LEFT = 195;

    var socket,
        PAGE_SIZE,
        mBus = router.getRoute('server');

    function jumpHandler(fn){
        socket.removeAllListeners('jump').on('jump', fn);
    }

    var onPlay = _.bind(player.onPlay, player, jumpHandler);

    function connected(data) {
        var loadTracks;
        player.stop();
        playlist.setCurrentPlaylistId(data.playlistId);

        if (data.currentlyPlaying) {
            var track = data.currentlyPlaying;
            loadTracks = function() {
                return $.get('/currentlyplaying', {pageSize:PAGE_SIZE})
                    .done(playlist.displayTracks)
                    .then(function() {
                        onPlay(track);
                        return $.when({paused: track.paused ? true : false});
                    });
            };
        } else {
            loadTracks = function() {
                return playlist.load()
                    .done(function(pagedRes) {
                        var firstDisplayed = playlist.displayTracks(pagedRes, true);
                        player.updateSongToPlay(firstDisplayed);
                    });
            };
        }

        player.updateVolume(data.volume);
        player.mute(!data.mute);

        return loadTracks();
    }

    function handleVolume(offset) {
        var percent = Math.round((offset/VOLUME_LENGTH) * 100);
        player.updateVolume(percent);
        player.mute(true);
        socket.emit('volume', percent);
    }

    function handleJump(offset) {

        var pos = $('#jukebox header .songScrollButton').position();

        console.log(JSON.stringify(pos));

        var percent = ((((offset - 15) - pos.left)/PROGRES_LENGTH)*100);

        console.log("Percent: ", percent);

        socket.emit('jump', percent);
    }

    mBus.addListener('play', function(data) {
        socket.emit('play', {id:data.id});
    });

    mBus.addListener('stop', function() {
        socket.emit('stop');
    });

    mBus.addListener("pause", function(paused) {
        socket.emit('pause');
    });

    mBus.addListener("resume", function(paused) {
        socket.emit('resume');
    });

    mBus.addListener("next", function() {
        socket.emit('next');
    });

    mBus.addListener("prev", function() {
        socket.emit('prev');
    });

    mBus.addListener('song_selected', function(data) {
        player.updateSongToPlay(data.id);
    });

    mBus.addListener('jump', handleJump);
    mBus.addListener('volume', handleVolume);

    mBus.addListener('unmute', function() {
        socket.emit('unmute');
    });

    mBus.addListener('mute', function(){
        socket.emit('mute');
    });

    // FIXME [mb] duplicate code
    mBus.addListener('show_config', function() {
        $('.qrCode').show().one('click', function() {
            $(this).hide();
        });
    });

    return {
        init: function(opts) {
            var connectOk;
            PAGE_SIZE = opts.pageSize;

            playlist.init(mBus, opts.homeUrl);

            socket = io.connect(opts.homeUrl, {
                'connect timeout': 500,
                'reconnect': true,
                'reconnection delay': 500,
                'reopen delay': 500,
                'max reconnection attempts': 10
            });


            socket.on('connected', function(data) {
                console.log("Connected event received!");
                connectOk = true;

                connected(data)
                    .done(function(data) {
                        mBus.notify('appReady', {paused: data.paused});
                    });
            });

            socket.on('play', function(track) {
                onPlay(track);
            });

            socket.on('done', function() {
                player.done();
            });

            socket.on('stop', function() {
                player.stop();
                playlist.stop();
            });

            socket.on('resume', function(currentTrack) {
                onPlay(currentTrack, true);
            });

            socket.on('pause', function() {
                player.paused();
            });

            socket.on('volume', function(percent) {
                player.mute(true);
                player.updateVolume(percent);
            });

            socket.on('mute', function() {
                player.mute();
            });

            socket.on('unmute', function() {
                player.mute(true);
            });

            socket.on('error', function(msg, err) {
                if (!connectOk) {
                    mBus.notify('connect_failed');
                }
                console.log("ERROR: ", msg, ", err: ", err);
            });

            socket.on('disconnect', function() {
                player.stop();
                playlist.stop();
            });

            return this;
        },
        destroy: function() {
            socket.disconnect();
            socket = null;
            playlist.destroy();
        }
    };
});
