var inherits = require('util').inherits,
  Mpg123Player = require('mpg123n').Player;


function Player() {
  Mpg123Player.apply(this, arguments);
}

inherits(Player, Mpg123Player);

module.exports = Player;

Player.prototype.resume = function() {
  this.pause();
};
