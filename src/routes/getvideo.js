var youtubedl = require('youtube-dl'),
  insert = require('../util/insert_track').insertTrack,
  fs = require('fs'),
  targetDir;

var service2url = {
  youtube: 'http://www.youtube.com/watch?v='
};

function YoutubeDlExecutor() {
  this.jobs = [];
  this.jobAddedListener();
}

require('util').inherits(YoutubeDlExecutor, require('events').EventEmitter);

YoutubeDlExecutor.prototype.addJob = function(job) {
  this.jobs.push(job);
  this.emit('job_added');
};

YoutubeDlExecutor.prototype.jobAddedListener = function() {
  var self = this;
  this.removeAllListeners('job_finished');
  this.removeAllListeners('error');
  this.once('job_added', function() {
    setTimeout(function() {
      self.execLastJob();
    }, 1);
  });
};

YoutubeDlExecutor.prototype.jobFinishedListener = function() {
  var self = this;
  this.once('job_finished', function() {
    self.removeAllListeners('error');
    setTimeout(function() {
      self.execLastJob();
    }, 1);
  });

  this.once('error', function() {
    self.removeAllListeners('job_finished');
    setTimeout(function() {
      self.execLastJob();
    }, 1);
  });
};

YoutubeDlExecutor.prototype.execLastJob = function() {
  if (!this.jobs.length) {
    this.jobAddedListener();
    return;
  }
  var self = this;
  var job = this.jobs.shift();

  console.log("Starting job: " + JSON.stringify(job));
  this.emit('job_started', job);

  var dl = youtubedl.download(job.videoUrl,
    targetDir,
    ['--extract-audio', '--audio-format=mp3', '--max-quality=10']
  );

  //will be called when the download starts
  dl.on('download', function(data) {
    console.log('Download started');
    console.log('filename: ' + data.filename);
    console.log('size: ' + data.size);
  });

  // will be called during download progress of a video
  dl.on('progress', function(data) {
    console.log(data.eta + ' ' + data.percent + '% at ' + data.speed + '\r');
  });

  // catches any errors
  dl.on('error', function(err) {
    console.log(err);
  });

  // called when youtube-dl finishes
  dl.on('end', function(data) {
    youtubedl.info(job.videoUrl, function(err, data) {
      if (err) {
        console.log(err);
        self.emit('error', err);
        return;
      }

      var file = targetDir + "/" + job.videoId + ".mp3";

      fs.stat(file, function(err, stat) {
        if (err) {
          console.log("ERROR: ", err);
          self.emit('error', err);
          return;
        }

        console.log("Wideo downloaded", data, ", ", "file");

        insert(file, data.title, function(err) {
          if (err) {
            console.log(err);
            self.emit('error', err);
          } else {
            console.log("Video converted and inserted");
            self.emit('job_finished');
          }
        });
      });
    });
  });
};

var exec = new YoutubeDlExecutor();

/**
 *
 * @param req
 * @param res
 *
 * @method GET
 * @urlparam videoid String
 * @urlparam service String [youtube]
 * @contentType application/json
 * @error 404 - video not found
 * @error 409 - video has been already downloaded
 * @error 400 - unknown service
 */
function index(req, res) {
  res.contentType('application/json');

  var videoid = req.params.videoid;
  var service = req.params.service || 'youtube';

  if (!videoid) {
    res.send(404);
    return;
  }

  var serviceUrl = service2url[service];
  if (!serviceUrl) {
    res.send(400, {msg: "Unknown service: " + service});
    return;
  }

  fs.stat(targetDir + '/' + videoid + '.mp3', function(err, stat) {
    if (!err) {
      res.send(409, {msg:"File already exists"});
      return;
    }

    var videoUrl = serviceUrl + videoid;

    exec.addJob({
      serviceUrl: serviceUrl,
      videoId: videoid,
      videoUrl: videoUrl
    });

    exec.once('error', function(data) {
      console.log("ERROR when converting video ", data);
    });

    res.send(200, {msg:'Job added to queue'});
  });
}

module.exports = {
  index: index,

  /**
   *
   * @param p
   * @param p.musicDir
   */
  init: function(p) {
    targetDir = p.musicDir;
  }
};