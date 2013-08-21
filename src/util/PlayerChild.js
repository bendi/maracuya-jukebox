
var Player = require('./Player'),
	player = new Player();

player.on('end', function() {
	process.send({event: 'end'});
});

player.on('play', function() {
	process.send({event: 'play'});
});

player.on('pause', function() {
	process.send({event: 'pause'});
});

player.on('error', function(data) {
	process.send({event: 'error', data: data});
});

process.on('message', function(data) {
	console.log('message', data);
	player[data.evt].apply(player, data.args);
});