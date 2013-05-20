var insert = require('../util/insert_track').insertTrack;

//
//Track.remove({}, function(err) {
//
//  if (err) {
//    console.log(err);
//  } else {
//    console.log("Removed!");
//  }
//
//  process.exit();
//});
//
//return;

module.exports = function(db, model) {
  return function(path) {
    insert(path, function(err) {
      if(err) {
        throw err;
      }

      process.exit();
    });
  };
};