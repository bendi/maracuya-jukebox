import {inherits} from "util";
import {EventEmitter} from "events";

var pwd = __dirname;

console.log("PWD: ", pwd);

function handleMessage(data) {
    this.emit(data.event, data.data);
}

function handleExit(fn, code, signal) {
    if (code) {
        console.log("Player crashed - restarting.");
        this.emit("error");
        process.nextTick(fn);
    } else {
        console.log("Player shutdown");
    }
}

function start() {
    var self = this;
    if (this.child) {
        this.child.removeAllListeners("message");
        this.child.removeAllListeners("exit");
        this.child.removeAllListeners("uncaughtException");
        delete this.child;
    }
    console.log("Restarting child module: ", pwd);
    this.child = require("child_process").fork(pwd + "/PlayerChild.js");
    this.child.on("message", handleMessage.bind(self));
    this.child.on("exit", handleExit.bind(self, start.bind(self)));
    this.child.on("uncaughtException", handleExit.bind(self, start.bind(self)));
}

function message(evt, data) {
    data = [].slice.call(data, 0);
    console.log("sending event", {evt: evt, args: data});
    this.child.send({evt: evt, args: data});
}

function PlayerParent() {
    start.call(this);
}

inherits(PlayerParent, EventEmitter);

export default PlayerParent;

PlayerParent.prototype.play = function () {
    message.call(this, "play", arguments);
};

PlayerParent.prototype.pause = function () {
    message.call(this, "pause", arguments);
};
PlayerParent.prototype.jump = function () {
    message.call(this, "jump", arguments);
};

PlayerParent.prototype.volume = function () {
    message.call(this, "volume", arguments);
};

PlayerParent.prototype.stop = function () {
    message.call(this, "stop", arguments);
};

PlayerParent.prototype.resume = function () {
    this.pause();
};
