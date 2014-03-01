/*global module:false*/
module.exports = function (grunt) {
    "use strict";
    
    var _ = require("lodash");
    
    grunt.loadNpmTasks("grunt-contrib-requirejs");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-image-embed");
    grunt.loadNpmTasks("grunt-preprocess");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-env");
    grunt.loadNpmTasks("grunt-phonegap");
    grunt.loadNpmTasks("grunt-node-webkit-builder");
    grunt.loadNpmTasks("grunt-curl");
    grunt.loadNpmTasks("grunt-contrib-compress");
    grunt.loadNpmTasks("grunt-tar.gz");

    function getWeinreUrlForEnv(nodeEnv, weinreUrl, weinre) {
        if (!weinreUrl && weinre) {
            switch (nodeEnv) {
            case "android":
                weinreUrl = "http://10.0.2.2:8080";
                break;
            case "development":
                weinreUrl = "http://localhost:8080";
                break;
            }
        }

        return weinreUrl;
    }

    var envVars = {"NODE_ENV": grunt.option("env") || "development"},
        weinreUrl = getWeinreUrlForEnv(envVars.NODE_ENV, grunt.option("weinreurl"), grunt.option("weinre"));

    envVars.PLATFORM = grunt.option("platform") || "web";

    if (weinreUrl) {
        envVars.WEINRE_URL = weinreUrl;
    }

    var pkg = require("./package.json"),
        mpg123n = require("./node_modules/mpg123n/package.json"),
        mp3info = require("./node_modules/mp3info/package.json"),
        sqlite3 = require("./node_modules/sqlite3/package.json");
        
    var nodeModules = _.map(pkg.dependencies, function (k, v) {
        return {expand: true, src: ["node_modules/" + v + "/**"], dest: "build"};
    });
    
    // Project configuration.
    grunt.initConfig({
        pkg : "<json:package.json>",

        env : {
            options : {
                //Shared Options Hash
            },
            dev : envVars,
            mobile: {
                NODE_ENV: "production",
                PLATFORM: "mobile"
            },
            web: {
                NODE_ENV: "production",
                PLATFORM: "web"
            },
            standalone: {
                NODE_ENV: "production",
                PLATFORM: "standalone"
            }
        },
        // js linting options
        jshint : {
            all : [
                "Gruntfile.js",
                "src/**/*.js",
            ],
            options : {
                jshintrc: "jshintrc.json",
                ignores: [
                    "src/*/external/**"
                ]
            },
        },

        clean : {
            build : "build",
            "post-web" : [
                "build/src/public/skins/*/gfx/**",
                "build/src/mobile"
            ],
            "post-mobile" : [
                "build/src/mobile/index.html",
                "build/src/mobile/skins/mobile_runner",
                "build/src/mobile/skins/maracuya-mobile/images/media-*.png",
                "build/src/modules",
                "build/src/public",
                "build/src/routes",
                "build/src/util",
                "build/src/db",
                "build/src/nw",
                "build/src/run.js",
                "build/src/build.txt",
            ]
        },

        copy : {
            main: {
                files: [
                    {expand: true, src : ["src/**"], dest : "build/src/"},
                    {expand: true, flatten: true, src : ["package.json", "../README.md"], dest : "build/"}
                ]
            },
            node_modules: {
                files: nodeModules
            },
            mobileBuildOutput: {
                files: [
                    {expand: true, flatten: true, src: ["../distrib/mobile/phonegap/www/*"], dest: "build/src/"}
                ]
            },
            standalone_sample_data_nw_win: {
                files: [
                    {cwd: "sample-data", expand: true, src: ["data/**", "mp3/**"], dest: "webkitbuilds/releases/nw/win/nw"}
                ]
            },
            standalone_sample_data_nw_mac: {
                files: [
                    {cwd: "sample-data", expand: true, src: ["data/**", "mp3/**"], dest: "webkitbuilds/releases/nw/mac/nw.app/Contents/Resources/app.nw"}
                ]
            }
        },

        curl: {
            "tmp/win/mpg123n-nw.tgz": "https://mpg123n.s3.amazonaws.com/Release/bindings-v" + mpg123n.version + "-nw-0.8.3-win32-ia32.tar.gz",
            "tmp/win/mp3info-nw.tgz": "https://mp3info.s3.amazonaws.com/Release/bindings-v" + mp3info.version + "-nw-0.8.3-win32-ia32.tar.gz",
            "tmp/win/sqlite3-nw.tgz": "https://maracuya-jukebox.s3.amazonaws.com/Release/node_sqlite3-v" + sqlite3.version + "-nw-0.8.3-win32-ia32.tar.gz",
            
            "tmp/mac/mpg123n-nw.tgz": "https://mpg123n.s3.amazonaws.com/Release/bindings-v" + mpg123n.version + "-nw-0.8.3-darwin-ia32.tar.gz",
            "tmp/mac/mp3info-nw.tgz": "https://mp3info.s3.amazonaws.com/Release/bindings-v" + mp3info.version + "-nw-0.8.3-darwin-ia32.tar.gz",
            "tmp/mac/sqlite3-nw.tgz": "https://maracuya-jukebox.s3.amazonaws.com/Release/node_sqlite3-v" + sqlite3.version + "-nw-0.8.3-darwin-ia32.tar.gz"
        },

        // gunzip each package
        // copy to proper localtion
        // run node-webkit task
        targz: {
            standalone_win: {
                files: {
                    "build/node_modules/mpg123n/build":  "tmp/win/mpg123n-nw.tgz",
                    "build/node_modules/mp3info/build":  "tmp/win/mp3info-nw.tgz",
                    "build/node_modules/sqlite3/lib/":   "tmp/win/sqlite3-nw.tgz"
                }
            },
            standalone_mac: {
                files: {
                    "build/node_modules/mpg123n/build":  "tmp/mac/mpg123n-nw.tgz",
                    "build/node_modules/mp3info/build":  "tmp/mac/mp3info-nw.tgz",
                    "build/node_modules/sqlite3/lib/":   "tmp/mac/sqlite3-nw.tgz"
                }
            }
        },

        requirejs : {
            web : {
                options : {
                    appDir :  "src",
                    baseUrl : "public/scripts",
                    dir :     "build/src",
                    paths : {
                        "underscore" :  "../external/lodash-1.0.0-rc.3",
                        "domReady" :    "../external/plugins/domReady-2.0.1",
                        "jquery" :      "../external/jquery-1.8.3.min",
                        "jqm" :         "../external/jquery.mobile-1.4.0",
                        "editinplace" : "../external/jquery.editinplace",
                        "jqr" :         "../external/jquery.qrcode.min",
                        "app" :         "../app",
                        "io" :          "empty:"
                    },
                    removeCombined : true,
                    skipDirOptimize : true,
                    shim : {
                        jqm : {
                            deps : [ "jquery" ],
                            exports : "jQuery.mobile"
                        },
                        editinplace : {
                            deps : [ "jquery" ]
                        }
                    },
                    uglify : {
                        max_line_length : 1000
                    },

                    modules : [ {
                        name : "app"
                    } ]
                }
            },
            demo : {
                options : {
                    appDir :  "src",
                    baseUrl : "public/scripts",
                    dir :     "build/src",
                    paths : {
                        "underscore" :  "../external/lodash-1.0.0-rc.3",
                        "domReady" :    "../external/plugins/domReady-2.0.1",
                        "jquery" :      "../external/jquery-1.8.3.min",
                        "jqm" :         "../external/jquery.mobile-1.4.0",
                        "editinplace" : "../external/jquery.editinplace",
                        "jqr" :         "../external/jquery.qrcode.min",
                        "app" :         "demoApp",
                    },
                    removeCombined : true,
                    skipDirOptimize : true,
                    shim : {
                        jqm : {
                            deps : [ "jquery" ],
                            exports : "jQuery.mobile"
                        },
                        editinplace : {
                            deps : [ "jquery" ]
                        }
                    },
                    uglify : {
                        max_line_length : 1000
                    },

                    modules : [ {
                        name : "app"
                    } ]
                }
            },
            mobile : {
                options : {
                    appDir :  "src",
                    baseUrl : "public/scripts",
                    dir :     "build/src",
                    paths : {
                        "underscore" :   "../external/lodash-1.0.0-rc.3",
                        "domReady" :     "../external/plugins/domReady-2.0.1",
                        "jquery" :       "../external/jquery-1.8.3.min",
                        "jqm" :          "../external/jquery.mobile-1.4.0",
                        "editinplace" :  "../external/jquery.editinplace",
                        "jqr" :          "../external/jquery.qrcode.min",
                        "mobile" :       "../../mobile/scripts/mobile",
                        "io" :           "../external/socket.io.min",
                        "playlist" :     "../../mobile/scripts/playlist",
                        "scanner" :      "../../mobile/scripts/scanner",
                        "eventHandler" : "../../mobile/scripts/eventHandler"
                    },
                    removeCombined : true,
                    shim : {
                        jqm : {
                            deps : [ "jquery" ],
                            exports : "jQuery.mobile"
                        },
                        editinplace : {
                            deps : [ "jquery" ]
                        }
                    },
                    skipDirOptimize : true,
                    uglify : {
                        max_line_length : 1000
                    },

                    modules : [ {
                        name : "mobile"
                    } ]
                }
            }
        },

        preprocess : {
            web : {
                files : {
                    "build/src/public/index.html" : "src/public/index.html",
                    "build/src/public/stream.html" : "src/public/stream.html"
                }
            },
            mobile : {
                src : "src/mobile/mobile.html",
                dest : "build/src/mobile/mobile.html"
            }
        },

        imageEmbed : {
            web : {
                src : [ "build/src/public/skins/lyric_show_player/style.css" ],
                dest : "build/src/public/skins/lyric_show_player/style.css"
            },
            mobile : {
                src : [ "build/src/mobile/skins/maracuya-mobile/style.css" ],
                dest : "build/src/mobile/skins/maracuya-mobile/style.css"
            }
        },

        compress : {
            main : {
                options : {
                    archive : "dist/<%= pkg.name %>-<%= pkg.version %>.zip"
                },
                files: {
                    src : "build/**",
                    base : "build",
                    subdir : "maracuya-jukebox"
                }
            },
            standalone_win: {
                options: {
                    archive: "dist/maracuya-jukebox-win-" + pkg.version + ".zip"
                },
                files: [
                    {cwd: "webkitbuilds/releases/nw/win/nw", src: ["**"], dest: "maracuya-jukebox/", expand: true},
                    {cwd: "webkitbuilds/releases/nw/win/nw", src: ["/data", "/mp3"], dest: "maracuya-jukebox/**", expand: true}
                ]
            },
            standalone_mac: {
                options: {
                    archive: "dist/maracuya-jukebox-mac-" + pkg.version + ".zip"
                },
                files: [
                    {cwd: "webkitbuilds/releases/nw/mac", src: ["**"], dest: "maracuya-jukebox/", expand: true}
                ]
            }
        },

        phonegap : {
            config : {
                root : "build/src",
                config : "../distrib/mobile/phonegap/www/config.xml",
                cordova : "../distrib/mobile/phonegap/.cordova",
                path : "phonegap",
                plugins : [
					 "http://github.com/phonegap-build/BarcodeScanner.git ",
                     "https://github.com/mkuklis/phonegap-websocket"
            	],
                platforms : [
                    "ios",
                    "android"
                ],
                maxBuffer : 200, // You may need to raise this for iOS.
                verbose : false,
                releases : "releases",
                releaseName : function () {
                    var pkg = grunt.file.readJSON("package.json");
                    return (pkg.name + "-" + pkg.version);
                },
                key: {
                    store: "../distrib/mobile/phonegap/android.keystore",
                    alias: "maracuya",
                    aliasPassword: function () {
                        // Prompt, read an environment variable, or just embed as a string literal
                        return process.env.ANDROID_ALIAS_PASSWORD;
                    },
                    storePassword: function () {
                        // Prompt, read an environment variable, or just embed as a string literal
                        return process.env.ANDROID_STORE_PASSWORD;
                    }
                },
                icons: {
                    android: {
                        ldpi: "../distrib/mobile/android/icons/icon-36-ldpi.png",
                        mdpi: "../distrib/mobile/android/icons/icon-48-mdpi.png",
                        hdpi: "../distrib/mobile/android/icons/icon-72-hdpi.png",
                        xhdpi: "../distrib/mobile/android/icons/icon-96-xhdpi.png",
                        xxhdpi: "../distrib/mobile/android/icons/icon-144-xxhdpi.png"
                    },
                    ios: {
                        icon57: "../distrib/mobile/ios/icons/icon-57.png",
                        icon57x2: "../distrib/mobile/ios/icons/icon-57@2x.png",
                        icon72: "../distrib/mobile/ios/icons/icon-72.png",
                        icon72x2: "../distrib/mobile/ios/icons/icon-72@2x.png"
                    }
                }
            }
        },
        nodewebkit: {
            mac: {
                options: {
                    version: "0.8.3",
                    app_name: "nw",
                    build_dir: "./webkitbuilds",
                    mac: true,
                    win: false,
                    linux32: false,
                    linux64: false,
                    keep_nw: true
                },
                src: [
                    "./build/**"
                ]
            },
            win: {
                options: {
                    version: "0.8.3",
                    app_name: "nw",
                    build_dir: "./webkitbuilds",
                    mac: false,
                    win: true,
                    linux32: false,
                    linux64: false,
                    keep_nw: true
                },
                src: [
                    "./build/**"
                ]
            }
        }
    });

    // Default task.
    grunt.registerTask("default", "jshint");
    grunt.registerTask("build:mobile", [ "env:dev", "jshint", "clean:build", "copy:main", "requirejs:mobile", "imageEmbed:mobile", "preprocess:mobile", "clean:post-mobile", "copy:mobileBuildOutput", "phonegap:build" ]);
    grunt.registerTask("build:web", [ "env:dev", "jshint", "clean:build", "copy:main", "copy:node_modules", "requirejs:web", "imageEmbed:web", "preprocess:web", "clean:post-web" ]);
    grunt.registerTask("build:demo", [ "env:dev", "jshint", "clean:build", "copy:main", "requirejs:demo", "imageEmbed:web", "preprocess:web", "clean:post-web" ]);

    grunt.registerTask("release:mobile", [ "env:mobile", "jshint", "clean:build", "copy:main", "requirejs:mobile", "imageEmbed:mobile", "preprocess:mobile", "clean:post-mobile", "copy:mobileBuildOutput", "phonegap:release" ]);
    grunt.registerTask("release:web", [ "env:web", "jshint", "clean:build", "copy:main", "copy:node_modules", "requirejs:web", "imageEmbed:web", "preprocess:web", "clean:post-web" ]);

    grunt.registerTask("release:standalone:win", [ "env:standalone", "jshint", "clean:build", "copy:main", "copy:node_modules", "requirejs:web", "imageEmbed:web", "preprocess:web", "clean:post-web", "curl", "targz:standalone_win", "nodewebkit:win", "copy:standalone_sample_data_nw_win", "compress:standalone_win" ]);
    grunt.registerTask("release:standalone:mac", [ "env:standalone", "jshint", "clean:build", "copy:main", "copy:node_modules", "requirejs:web", "imageEmbed:web", "preprocess:web", "clean:post-web", "curl", "targz:standalone_mac", "nodewebkit:mac", "copy:standalone_sample_data_nw_mac", "compress:standalone_mac" ]);
    grunt.registerTask("release:standalone", [ "env:standalone", "jshint", "clean:build", "copy:main", "copy:node_modules", "requirejs:web", "imageEmbed:web", "preprocess:web", "clean:post-web" ]);

    grunt.registerTask("test", ["jshint"]);
};
