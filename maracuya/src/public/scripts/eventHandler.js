define([
    'jquery',
    'jqm',
    'console',
    'mbusRouter',
    'common'
  ],
  function($, jqm, console, router, common) {

  // constants
  var PROGRES_LENGTH = 260,
    VOLUME_LENGTH = 87,
    VOLUME_OFFSET_LEFT = 195;

  var KEY = {
      SPACE: 32,
      X: 120,
      B: 98,
      V: 118,
      Z: 122
  };

  var paused = false;

  function pause() {
    if (!paused) {
      router.notify('pause');
    } else {
      router.notify('resume');
    }
    paused = !paused;
  }

  function play(id) {
    router.notify('play', {id:id});
  }

  function next() {
    router.notify('next');
  }

  function prev() {
    router.notify('prev');
  }

  function stop() {
    router.notify('stop');
  }

  $(document).on('vclick', '#jukebox header .playButtons [data-action="play"]', function(e) {
    var $this = $(this);
    play($this.data('id'));
  });

  $(document).on('vclick', '#jukebox header .playButtons [data-action="stop"]', stop);

  $(document).on('vclick', '#jukebox header .playButtons [data-action="pause"]', pause);

  $(document).on('vclick', '#jukebox header .playButtons [data-action="next"]', next);

  $(document).on('vclick', '#jukebox header .playButtons [data-action="prev"]', prev);

  $(document).on('vclick', '#jukebox .playlist div', function(e) {
    var $this = $(this);
    $('#jukebox .playlist > div.active').removeClass('active');
    $this.addClass('active');
    router.notify('song_selected', {id:$this.data('id')});
  });

  $(document).on('dblclick', '#jukebox .playlist div', function(e) {
    var $this = $(this);
    play($this.data('id'));
  });

  if (!common.isAndroid()) {
    $('#jukebox .playlistContainer').on('scrollstop', function(e) {
      var $this = $(this),
        $playlist = $('.playlist', $this);
      if ($this.scrollTop() <= 1) {
        router.notify('playlist_top_reached', $this);
      } else if ($this.scrollTop() > $playlist.innerHeight() - $this.height() - 5) {
        router.notify('playlist_end_reached', $this);
      }
    });
  } else {
    // TODO [mb] playlist should be moved into iframe so all events are handled from there
    $(document).on('scrollstop', function(e) {
      var $this = $(this);
      if ($this.scrollTop() <= $('#jukebox header').outerHeight()) {
        router.notify('playlist_top_reached', $('#jukebox .playlistContainer .playlist'));
      } else if ($(window).scrollTop() + $(window).height() >= $(document).height() - 40) {
        router.notify('playlist_end_reached', $('#jukebox .playlistContainer .playlist'));
      }
    });
  }

  $(document).on('vclick', '#jukebox header .duration', function(e) {
    router.notify('elapsed', !$(this).data('elapsed'));
  });

  $(document).on('vclick', '#jukebox header', function(e) {
    var offset = common.offset(e, this);

    console.log(offset.x, ' ', offset.y);

    if (offset.y > 110 && offset.y < 140 && offset.x > 5 && offset.x < PROGRES_LENGTH) {
      // half of progress button width
      router.notify('jump', (offset.x - 15));
    }
    if (offset.y > 150 && offset.y < 170 && offset.x > 185 && offset.x < 275) {
      // volume offset
      router.notify('volume', offset.x - VOLUME_OFFSET_LEFT);
    }
  });

  $(document).on('vclick', '#jukebox header .songProgress', function(e) {
    var offset = common.offset(e, this);

    e.stopPropagation();
    // half of progress button width
    router.notify('jump', offset.x - 15);
  });

  $(document).on('vclick', '#jukebox header .volumeIndicator', function(e) {
    var offset = common.offset(e, this);

    e.stopPropagation();
    // half of progress button width
    router.notify('volume', offset.x - 15);
  });
  $(document).on('vclick', '#jukebox header .muteButton', function(e) {
    e.stopPropagation();

    var $this = $(this);
    var on = $this.hasClass('muteOn');
    router.notify(on ? 'unmute' : 'mute');
  });

  $(document).on('vclick', '#jukebox header .showMediaPlaylistButtons span[data-action="toggle-playlist"]', function(e) {
    $('#jukebox .playlistContainer, #jukebox .playlistHeader, #jukebox .playlistFooter, #scroll').toggle();
    router.notify('playlist_toggle', $('#jukebox .playlistContainer, #jukebox .playlistHeader').is(':visible'));
  });

  $(document).on('vclick', '#jukebox header .config', function(e) {
    router.notify('show_config');
  });

  $(document).on('keypress', function(e) {
    console.log("WHICH: ", e.which);
    switch(e.which) {
      case KEY.SPACE:
        pause();
        break;
      case KEY.X:
        var id = $('#jukebox header .playButtons [data-action="play"]').data('id');
        if (id) {
          play(id);
        }
        break;
      case KEY.B:
        next();
        break;
      case KEY.V:
        stop();
        break;
      case KEY.Z:
        prev();
        break;
      default:
        // prevent only known ones
        return;
    }
    e.preventDefault();
  });

  return {
    init: function(paused_) {
      paused = paused_;
    }
  };
});