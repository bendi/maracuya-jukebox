var inherits = require('util').inherits,
	EventEmitter = require('events').EventEmitter;


function start() {
	var self = this;
	this.child = require('child_process').fork("./src/util/PlayerChild.js");
	this.child.on('message', function(data) {
		self.emit(data.event, data.data);
	});
	this.child.on('exit', function(code, signal) {
		if (code) {
			process.nextTick(function() {
				console.log("Player crashed - restarting.");
				start.call(self);
			});
		}
	});
};

function message(evt, data) {
	console.log("sending event", {evt: evt, args: data});
	this.child.send({evt: evt, args: [].slice.call(data, 0)});
}

function PlayerParent() {
	start.call(this);
}

inherits(PlayerParent, EventEmitter);

module.exports = PlayerParent;

PlayerParent.prototype.play = function() {
	message.call(this, 'play', arguments);
};

PlayerParent.prototype.pause = function() {
	message.call(this, 'pause', arguments);
};
PlayerParent.prototype.jump = function() {
	message.call(this, 'jump', arguments);
};

PlayerParent.prototype.volume = function() {
	message.call(this, 'volume', arguments);
};

PlayerParent.prototype.stop = function() {
	message.call(this, 'stop', arguments);
};

PlayerParent.prototype.resume = function() {
	this.pause();
};
