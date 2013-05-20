define([
    'jquery',
    'jqm',
    'underscore',
    'config',
    'upload'
  ], function($, jqm, _, config, upload) {

  var PAGE_SIZE = config('playlistPageSize'),
    homeUrl = config('homeUrl');

  function MediaLibrary(){}

  MediaLibrary.prototype.mediaLibraryItem = function(type, $item, track) {
    $('.' + type, $item)
    .html(track[type])
    .editInPlace({
      url: homeUrl + '/track/' + track.id,
      update_value: type,
      error: function(e) {
        alert("Couldn't save your change.");
        console.log("ERROR: ", e);
      }
    });
  };

  MediaLibrary.prototype.displayMediaLibrary = function(pagedRes) {
    var tracks = pagedRes.items, that = this;
    _.each(tracks, function(track) {
      var $item = $('<div class="mlTrack"><span class="artist"></span><span class="album"></span><span class="title"></span><span class="length"></span></div>')
        .appendTo('#jukebox .mediaLibrary .tracks');

      that.mediaLibraryItem('artist', $item, track);
      that.mediaLibraryItem('album', $item, track);
      that.mediaLibraryItem('title', $item, track);

    });
  };

  var mediaLibrary = new MediaLibrary();

  $(document).on('keyup', '#jukebox .mediaLibrary .search input', function(e) {
    var value = $(this).val();
    $.get('/searchtracks', {pageSize:PAGE_SIZE, txt: value})
      .done(function(pagedRes) {
        $('#jukebox .mediaLibrary .tracks').empty();
        mediaLibrary.displayMediaLibrary(pagedRes);
      });
  });

  $(document).on('vclick', "#jukebox .mediaLibrary .menu span", function(e) {
    var $target = $(e.target),
      li = $target.closest('li'),
      selected = li.hasClass('selected'),
      active = $target.hasClass('active');

    $("#jukebox .mediaLibrary .menu .active").removeClass("active");
    if (!selected) {
      li.addClass('selected active').parents('li').addClass('selected');
    } else {
      li.removeClass('selected').parents('li').removeClass("selected");
    }
  });

  $(document).on('vclick', "#jukebox .mediaLibrary .menu a", function(e) {
    var $this = $(this);
    $("#jukebox .mediaLibrary .menu .active").removeClass("active");
    $this.parent().addClass('active');
  });

  $(document).on('vclick', "#jukebox .mediaLibrary .menu li.active a", function(e) {
    return !$(e.target).parent().hasClass('active');
  });

  $(document).on('vclick', '#jukebox .mediaLibrary .content .audio .search span', function(e) {
    $('#jukebox .mediaLibrary .search input').val('');
    $.get('/searchtracks', {pageSize:PAGE_SIZE})
    .done(function(pagedRes) {
      $('#jukebox .mediaLibrary .tracks').empty();
      mediaLibrary.displayMediaLibrary(pagedRes);
    });
  });

  $(document).on('vclick', '#jukebox .mediaLibrary .menu a[data-action="local-media-audio"]', function(e) {
    $('#jukebox .mediaLibrary .content > div').hide();
    $('#jukebox .mediaLibrary .content > div.local-media-audio').show();
  });

  $(document).on('vclick', '#jukebox .mediaLibrary .menu a[data-action="services-video-download"]', function(e) {
    $('#jukebox .mediaLibrary .content > div').hide();
    $('#jukebox .mediaLibrary .content > div.services-video-download').show();
  });

  $(document).on('vclick', '#jukebox .mediaLibrary .content .services-video-download .url span', function(e) {
    var url = $('#jukebox .mediaLibrary .content .services-video-download .url input').val();
    if (url.indexOf('youtube') !== -1) {
      var id = url.match(/\?v=([a-z0-9]+)/i)[1];
      url = "http://www.youtube.com/embed/" + id;
    }
    $('#jukebox .mediaLibrary .content .services-video-download iframe').attr('src', url);
  });

  $(document).on('vclick', '#jukebox .mediaLibrary .content .services-video-download .bottom span[data-action="getvideo"]', function(e) {
    var url = $('#jukebox .mediaLibrary .content .services-video-download .url input').val();
    if (url.indexOf('youtube') !== -1) {
      var id = url.match(/\?v=([a-z0-9]+)/i)[1];
      $.post('/getvideo/youtube/' + id)
        .done(function(data) {
          console.log("Request sent!");
        });
    } else {
      alert("Unsupported media supplier.");
      return false;
    }
  });

  $(document).on('vclick', '#jukebox header .showMediaPlaylistButtons span[data-action="toggle-library"]', function(e) {
    if ($('#jukebox .mediaLibrary').toggle().is(":visible")) {
      $.get('/searchtracks', {pageSize:PAGE_SIZE})
        .done(_.bind(mediaLibrary.displayMediaLibrary, mediaLibrary));
    }
  });

  $(function() {
    var files;
    upload(homeUrl, '#jukebox .mediaLibrary', {
      init: function(files_) {
        files = _.toArray(files_);
        // build upload list + update number of files being uploaded
        if (files.length) {
          $('.mediaLibrary a[data-action="services-files-upload"]').html("Files upload (" + files.length + ")");
        }
        console.log("Starting upload of: " + files.length + " files.");
      },
      start: function(file) {
        // mark upload as in progress
        console.log("Uploading files: " + file.name);
      },
      progress: function(fileName, curr, total) {
        // update progress bar
        var complete = (curr / total * 100 | 0);
        console.log("File uploaded: " + fileName + ", curr: " + curr + ", total: " + total + ", percent: " + complete);
      },
      end: function(fileName, hasNext) {
        // mark upload as finished and decide if waiting for more uploads to come
        var file = files.shift();
        console.log("Finished: " + fileName + ", " + file.name);

        if (hasNext) {
          $('.mediaLibrary a[data-action="services-files-upload"]').html("Files upload (" + files.length + ")");
        } else {
          $('.mediaLibrary a[data-action="services-files-upload"]').html("Files upload");
        }
      },
      error: function(err, file) {
        // if anything goes wrong...
      }
    });
  });


  return mediaLibrary;
});