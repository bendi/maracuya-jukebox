maracuyá-jukebox [![Build Status](https://travis-ci.org/bendi/maracuya-jukebox.png?branch=master)](https://travis-ci.org/bendi/maracuya-jukebox)
===============

Maracuyá is a javascript based virutal mp3 player that lets you control your playlist from a browser. It support all major browsers including: IE, Safari, Firefox, Chrome and different operating systems: Windows, Linux, Mac OS

Read more on http://maracuya-jukebox.com

This is a JavaScript-everywhere project:

| **Project**    | **Library used**
|:---------------|:------------------------------------------------------
| server-side    | [nodejs](http://nodejs.org/)
| client-side    | browser
| mobile         | [phonegap](http://phonegap.com/)
| standalone     | [node-webkit](https://github.com/rogerwang/node-webkit)
| build-system   | [grunt](gruntjs.com)

Building
------------

Prequisites
----------------------
Build system uses grunt project and node-pre-gyp so first you need to install the two:
```
npm install -g grunt-cli node-pre-gyp@0.4.1 
```

If you want to be able to build mobile clients yourself you're also going to need phonegap package:
```
npm install -g phonegap@3.2.0-0.17.1
```

`NOTE:` phonegap is in older version due to [this bug](http://stackoverflow.com/questions/21388709/cordova-3-3-1-0-1-2-phonegap-plugins-doesnt-work)

Dependencies
----------------------
After you have required global modules you can start with installation by issuing:
```
npm install
```
This should download all dependencies as well as precompbiled binary modules using node-pre-gyp. Support for most popular platforms is out-of-the box but not all so you can build native modules on your own using [node-gyp](https://github.com/TooTallNate/node-gyp) or contact me to provide binary for your platform :)

Commands
----------------------
Maracuyá jukebox is javascript-everywhere project, so there's variety of build commands which produce different results and have some configuration options (all of them need to be issued from maracuya-jukebox/maracuya directory):

| **Command**               | **Description**                                           | **Options**
|:--------------------------|:----------------------------------------------------------|:----------------
| `default`                 | Invokes `jshint` and builds performs static code analysis
| `build:mobile`            | Builds maracuyá jukebox mobile client (JavaScript client layer, no `phonegap` yet) | --env (production/dev) [dev] --mobiles (ios,android) [android]
| `build:web`               | Builds maracuyá jukebox headless/server (might be part of [debian](https://github.com/bendi/maracuya-jukebox/tree/master/distrib/headless/debinstall) build)
| `build:demo`              | Builds [demo application](http://maracuya-jukebox.com/demo/)
| `release:mobile`          | Builds and signs mobile application, currently `android` only.
| `release:standalone:win`  | Builds  maracuyá jukebox standalone using [node-webkit](https://github.com/rogerwang/node-webkit)
