
var trackDao = require('../db/dao/TrackDao'),
  fs = require('fs'),
  probe = require('node-ffprobe');

function insertTrack(path, title, fn) {
  if (typeof(title) === 'function') {
    fn = title;
    title = '';
  }
  console.log("PATH: " + path);

  probe(path, function(error, data) {
    if (error) {
      return fn(error);
    }

    var mp3info = {
      duration: Math.round(data.format.duration),
      title: data.metadata.title || title,
      artist: data.metadata.artist,
      album: data.metadata.album,
      path: fs.realpathSync(path)
    };

    trackDao.create(mp3info, function(err) {
      if (err) {
        return fn(err);
      }

      console.log("Created: " + JSON.stringify(mp3info));

      fn();
    });

  });
}

module.exports = {
  insertTrack: insertTrack
};