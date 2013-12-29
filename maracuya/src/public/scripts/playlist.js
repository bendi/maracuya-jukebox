define([
    'underscore',
    'config',
    'common',
    'console'
], function(_, config, common, console) {

    var PAGE_SIZE = config('playlistPageSize'),
        pagesLoaded = [],
        currentPlaylistId=1,
        isPageLoading = true,
        mBus,
        displayTracks = function(pagedRes, back) {
            try {
                var append = pagesLoaded.length > 0 ? true : false,
                    that = this;
                pagesLoaded[back?'push':'unshift'](pagedRes.page);

                var ret = _displayTracks.call(that, PAGE_SIZE, pagedRes, append, back);
                if (Math.ceil((_.last(pagesLoaded)+1) * PAGE_SIZE) >= pagedRes.total) {
                    mBus.removeListeners('playlist_end_reached');
                }

                if (pagedRes.page === 0) {
                    mBus.removeListeners('playlist_top_reached');
                }
                isPageLoading = false;
                return ret;
            } catch(e) {
                isPageLoading = false;
                throw e;
            }
        };

    function onPlaylistEndReached(e, el) {
        var nextPage = _.last(pagesLoaded)+1,
        that = this;

        if (!isPageLoading && _.indexOf(pagesLoaded, nextPage) === -1) {
            $('.playlist', el).append('<div class="loading">Loading...</div>');

            load(nextPage)
                .fail(function() {
                    isPageLoading = false;
                })
                .done(function(pagedRes) {
                    displayTracks.call(that, pagedRes, true);
                    $('.playlist .loading', el).remove();
                });
        }
    }


    function onPlaylistTopReached(e, el) {
        var prevPage = _.first(pagesLoaded)-1,
            that = this;

        if (!isPageLoading && prevPage >= 0 && _.indexOf(pagesLoaded, prevPage) === -1) {
            $('.playlist', el).prepend('<div class="loading">Loading...</div>');

            load(prevPage)
                .fail(function() {
                    isPageLoading = false;
                })
                .done(function(pagedRes) {
                    displayTracks.call(that, pagedRes, false);
                    $('.playlist .loading', el).remove();
                });
        }
    }

    function load(page) {
        isPageLoading = true;
        return $.get('/playlist/' + currentPlaylistId, {pageSize:PAGE_SIZE, page: page, rand: Math.round(Math.random()*100000)})
            .fail(function() {
                isPageLoading = false;
            });
    }

    /**
     *
     * @param pageSize
     * @param pagedRes
     * @param append - should list be cleared when displaying results
     * @param back - are adding in front or at the back
     *
     */
    function _displayTracks(pageSize, pagedRes, append, back) {
        var tracks = pagedRes.items,
            currentPage = (pagedRes.page + (!back ? 1 : 0)) * pagedRes.pageSize,
            direction = back ? 1 : -1;

        // tracks
        // make sure we're not getting here some event obj or some other bs
        if (append === false) {
            $('#jukebox .playlist').empty();
        }

        var height = $('#jukebox .playlist').outerHeight();

        if (!back) {
            tracks = tracks.reverse();
            --currentPage;
        }

        $.each(tracks, function(i, track) {
            var $track = $('#trackTemplate')
                .clone()
                .prop('id', '')
                .attr('data-id', track.id)
                [back ? 'appendTo' : 'prependTo']('#jukebox .playlist');

            $('.num', $track).html(currentPage + (i+direction) * direction + '.');
            $('.name', $track).html(common.title(track));
            $('.duration', $track).html(common.dateToMinutes(track.duration));

            console.log("Building track: " + JSON.stringify(track));
        });

        // giver browser time to render view
        if (this.current) {
            updateCurrentTrack.call(this, this.current);
        } else if (!back) {
            setTimeout(function() {
                var offset = $('#jukebox .playlist').outerHeight() - height,
                scrollTop = $('#jukebox .playlistContainer').scrollTop();

                if (offset > 0) {
                    $('#jukebox .playlistContainer').scrollTop(scrollTop + offset);
                }

            }, 1);
        }

        if (tracks.length) {
            if (append === false && pagedRes.page > 0) {
                // scroll by 2 pixels so it's possible to load preceeding items
                $('#jukebox .playlistContainer').scrollTop(2);
            }
            return this.currrent || tracks[0].id;
        }
        return null;
    }

    function updateCurrentTrack(trackId) {
        this.current = trackId;

        var that = this,
            top = $('#jukebox .playlist div.current').is(':first-child'),
            bottom = $('#jukebox .playlist div.current').is(':last-child');

        $('#jukebox .playlist div.active').removeClass('active');
        $('#jukebox .playlist div.current').removeClass('current');

        var $this = $('#jukebox .playlist div[data-id="' + trackId + '"]');
        if ($this.length) {
            activateCurrent.call(that, $this);
        } else if (top) {
            onPlaylistTopReached.call(that, {}, $('#jukebox .playlistContainer'));
        } else if (bottom) {
            onPlaylistEndReached.call(that, {}, $('#jukebox .playlistContainer'));
        }
    }

    function activateCurrent($this) {
        $this.addClass('active current');

        var scrollTop = $('#jukebox .playlistContainer').scrollTop(),
            top = _.reduce($this.prevAll('div'), function(total, el){total += $(el).outerHeight();return total;},$this.outerHeight());

        if (top < scrollTop) {
            $('#jukebox .playlistContainer').scrollTop(top - $this.outerHeight());
        } else {
            top -= $('#jukebox .playlistContainer').innerHeight();
            if (top > scrollTop) {
                $('#jukebox .playlistContainer').scrollTop(top);
            }
        }
    }

    function stop() {
        $('#jukebox .playlist div.current').removeClass('current');
    }

    return {
        init: function(mBus_) {
            mBus = mBus_;
            var that = this;
            mBus.addListener('playlist_end_reached', function() {
                var args = arguments;
                setTimeout(function(){
                    onPlaylistEndReached.apply(that, args);
                }, 1);
            });
            mBus.addListener('playlist_top_reached', function() {
                var args = arguments;
                setTimeout(function(){
                    onPlaylistTopReached.apply(that, args);
                }, 1);
            });
        },
        setCurrentPlaylistId: function(id) {
            currentPlaylistId = id;
            pagesLoaded = [];
            this.currrent = null;
        },
        load: load,
        destroy: function() {
            if (mBus) {
                mBus.removeListeners('playlist_end_reached');
                mBus.removeListeners('playlist_top_reached');
            }
            pagesLoaded = [];
        },
        displayTracks: displayTracks,
        updateCurrentTrack: updateCurrentTrack,
        stop: stop
    };
});