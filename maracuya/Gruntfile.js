/*global module:false*/
module.exports = function(grunt) {
    "use strict";

    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks("grunt-image-embed");
    grunt.loadNpmTasks('grunt-preprocess');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-phonegap');

    function getWeinreUrlForEnv(nodeEnv, weinreUrl, weinre) {
        if (!weinreUrl && weinre) {
            switch(nodeEnv) {
            case 'android':
                weinreUrl = 'http://10.0.2.2:8080';
                break;
            case 'development':
                weinreUrl = 'http://localhost:8080';
                break;
            }
        }

        return weinreUrl;
    }

    var envVars = {"NODE_ENV": grunt.option('env') || 'development'},
        weinreUrl = getWeinreUrlForEnv(envVars["NODE_ENV"], grunt.option('weinreurl'), grunt.option('weinre'));

    if (weinreUrl) {
        envVars["WEINRE_URL"] = weinreUrl;
    }

    // Project configuration.
    grunt.initConfig({
        pkg : '<json:package.json>',

        env : {
            options : {
                //Shared Options Hash
            },
            dev : envVars
        },
        // js linting options
        jshint : {
            all : [
                'Gruntfile.js',
                'src/routes/*.js',
                'src/util/*.js',
                'src/*.js',
                'src/public/*.js',
                'src/public/scripts/**',
                'src/mobile/scripts/*.js'
            ],
            options : {
                curly : true,
                eqeqeq : true,
                immed : true,
                latedef : true,
                newcap : true,
                noarg : true,
                sub : true,
                undef : true,
                eqnull : true,
                browser : true,
                nomen : false,
                indent : 4,
                node : true,
                devel : true,
                jquery : true,

                globals : {
                    "cordova" : true,
                    "define" : true,
                    "_" : true
                }
            },
        },

        clean : {
            build : "build",
            'post-web' : [
                'build/src/public/skins/*/gfx/**',
                'build/src/mobile'
            ],
            'post-mobile' : [
                'build/src/mobile/index.html',
                'build/src/mobile/skins/mobile_runner',
                'build/src/mobile/skins/maracuya-mobile/images',
                'build/src/modules',
                'build/src/public',
                'build/src/routes',
                'build/src/util',
                'build/src/db',
                'build/src/run.js',
                'build/src/build.txt',
            ]
        },

        copy : {
            main: {
                files: [
                    {expand: true, src : ["src/**"], dest : "build/src/"},
                    {expand: true, flatten: true, src : ['package.json', '../README.md'], dest : 'build/'},
                ]
            },
            mobileBuildOutput: {
                files: [
                    {expand: true, flatten: true, src: ['../distrib/mobile/phonegap/www/*'], dest: 'build/src/'}
                ]
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
                            deps : [ 'jquery' ],
                            exports : 'jQuery.mobile'
                        },
                        editinplace : {
                            deps : [ 'jquery' ]
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
                            deps : [ 'jquery' ],
                            exports : 'jQuery.mobile'
                        },
                        editinplace : {
                            deps : [ 'jquery' ]
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
                            deps : [ 'jquery' ],
                            exports : 'jQuery.mobile'
                        },
                        editinplace : {
                            deps : [ 'jquery' ]
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
                    'build/src/public/index.html' : 'src/public/index.html',
                    'build/src/public/stream.html' : 'src/public/stream.html'
                }
            },
            mobile : {
                src : 'src/mobile/mobile.html',
                dest : 'build/src/mobile/mobile.html'
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
            options : {
                archive : 'dist/<%= pkg.name %>-<%= pkg.version %>.zip'
            },
            main : {
                src : 'build/**',
                base : 'build',
                subdir : 'maracuya-jukebox'
            }
        },

        phonegap : {
            config : {
                root : 'build/src',
                config : '../distrib/mobile/phonegap/www/config.xml',
                cordova : '../distrib/mobile/phonegap/.cordova',
                path : 'phonegap',
                plugins : [
                    'http://github.com/phonegap-build/BarcodeScanner.git ',
                    'https://github.com/mkuklis/phonegap-websocket'
                ],
                platforms : [
                    'android'
                ],
                maxBuffer : 200, // You may need to raise this for iOS.
                verbose : false,
                releases : 'releases',
                releaseName : function() {
                    var pkg = grunt.file.readJSON('package.json');
                    return (pkg.name + '-' + pkg.version);
                },
            }
        }
    });

    // Default task.
    grunt.registerTask('default', 'jshint');
    grunt.registerTask('build:mobile', [ 'env', 'jshint', 'clean:build', 'copy:main', 'requirejs:mobile', 'imageEmbed:mobile', 'preprocess:mobile', 'clean:post-mobile', 'copy:mobileBuildOutput', 'phonegap:build' ]);
    grunt.registerTask('build:web', [ 'env', 'jshint', 'clean:build', 'copy:main', 'requirejs:web', 'imageEmbed:web', 'preprocess:web', 'clean:post-web' ]);
    grunt.registerTask('build:demo', [ 'env', 'jshint', 'clean:build', 'copy:main', 'requirejs:demo', 'imageEmbed:web', 'preprocess:web', 'clean:post-web' ]);
};
