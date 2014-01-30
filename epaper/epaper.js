#!/usr/bin/env node


var	qrCode = require('qrcode-npm'),
	exec = require('child_process').exec; 

//var text = "I want it all!";
var text = process.argv[2];

var qr = qrCode.qrcode(4, 'M');
qr.addData(text);
qr.make();

var img = qr.createImgTag(4);    // creates an <img> tag as text

img = img.replace(/^.*?src="(.*?)".*$/, "$1");

var child = exec("sudo python "+__dirname+"/epaper.py '" + img + "'", function(e, stdout, stdin){
if (e) {
console.log(e);
}

});
