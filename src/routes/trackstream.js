var TrackDao = require('../db/dao/TrackDao'),
  fs = require('fs'),
  ffmpeg = require('fluent-ffmpeg');

var MEDIA_TYPE = {
  mp3: 'audio/mpeg',
  ogg: 'audio/ogg'
};

/**
 * @private
 * @param res
 * @param type
 * @param status
 * @param start
 * @param end
 * @param size
 * @param total
 */
function head(res, type, status, start, end, size, total) {
  total = total || size;
  res.writeHead(status, {
    'Content-Type': type,
    'Content-Length': size,
    'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
    'Accept-Ranges': 'bytes'
  });

}

/**
 * @private
 * @param range
 * @param total
 * @returns {start,end,chunksize,total}
 */
function handleRange(range, total) {
  var parts = range.replace(/bytes=/, "").split("-");
  var partialstart = parts[0];
  var partialend = parts[1];

  var start = parseInt(partialstart, 10);
  var end = partialend ? parseInt(partialend, 10) : total-1;
  return {
    start: start,
    end: end,
    chunksize: (end-start)+1,
    total: total
  };
}

/**
 *
 * @param req
 * @param res
 *
 * @method GET
 *
 * @urlparam id Number
 * @urlparam type String
 *
 * @contentType audio/mpeg;audio/ogg (for 200/OK response)
 * @contentType application/json
 */
function index(req, res) {

  var id = req.params.id,
    type = req.params.type,
    mediaType = MEDIA_TYPE[type];

  if (!id) {
    res.send(400, {msg: "Track id is missing"});
    return;
  }

  TrackDao.getById(id)
    .error(function() {
      res.send(404,{});
    })
    .success(function(track) {
      var stat = fs.statSync(track.path),
        file,
        total = stat.size;

      if (type === 'mp3') {
        if (req.headers.range) {
          var range = handleRange(req.headers.range, total);
          console.log('RANGE: ' + range.start + ' - ' + range.end + ' = ' + range.chunksize);

          file = fs.createReadStream(track.path, range);

          head(res, mediaType, 206, range.start, range.end, range.chunksize, range.total);

          file.pipe(res);
        } else {
          head(res, mediaType, 200, 0, total-1, stat, total);
          file = fs.createReadStream(track.path);
          file.pipe(res);
        }
      } else {
        console.log("Media type: " + mediaType);

        res.writeHead(200, {
          'Content-Type': mediaType
        });

        new ffmpeg({ source: track.path, priority: 10})
          .withAudioCodec('libvorbis')
          .toFormat('ogg')
          // save to stream
          .writeToStream(res, function(retcode, error) {
            if (error) {
              return console.log(error);
            }
            console.log('file has been converted succesfully');
          });
      }
  });
}

module.exports = {
  index: index
};