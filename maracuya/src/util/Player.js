import {inherits} from "util";
import {Player as Mpg123Player} from "mpg123n";


function Player() {
    Mpg123Player.apply(this, arguments);
}

inherits(Player, Mpg123Player);

export default Player;

Player.prototype.resume = function () {
    this.pause();
};
