define(function() {
  var TZ_OFFSET = new Date().getTimezoneOffset() * 60000;
  var android = navigator.userAgent.indexOf("Android") >= 0,
    firefox = navigator.userAgent.indexOf("Firefox") >= 0;

  function date(unixtimestampmilis) {
    if (unixtimestampmilis !== undefined) {
      unixtimestampmilis += TZ_OFFSET;
      return new Date(unixtimestampmilis);
    }
    return new Date();
  }

  return {
    offset: function(e, el) {
      var posX = $(el).position().left,
        posY = $(el).position().top,
        offsetX = e.pageX - posX,
        offsetY = e.pageY - posY;

      return {x:offsetX, y:offsetY};
    },
    title : function (track) {
      var _title = [track.artist, track.album, track.title];
      if (_title.join('').length) {
        return _title.join('-');
      } else {
        var path = track.path.split('/').slice(-3);
        return path.join('/');
      }
    },
    dateToMinutes : function dateToMinutes(seconds) {
      return (/[\d:]{5} /).exec(date(seconds*1000));
    },
    isAndroid: function() {
      return android;
    },
    isFirefox: function() {
      return firefox;
    },
    isIE: function() {
      return document.all !== undefined;
    }
  };
});