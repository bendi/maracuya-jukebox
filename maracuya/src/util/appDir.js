var  fs = require('fs'),
  mkdirp = require('mkdirp'),
  userHome = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'],
  appDir = userHome + '/.virtual-jukebox';

function get(dir) {
  if (dir) {
    dir = appDir + '/' + dir;
  } else {
    dir = appDir;
  }

  if (!fs.existsSync(dir)) {
    mkdirp.sync(dir, parseInt('0755', 8));
  }

  return dir;
}

get.init = function(appDir_) {
	if (appDir_ !== undefined) {
		appDir = appDir_;
	}
	delete get.init;
	return get;
};

module.exports = get;
