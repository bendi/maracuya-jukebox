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

    // Project configuration.
    grunt.initConfig({
        pkg : '<json:package.json>',

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
            src : {
                src : "src/**",
                dest : "build/src/"
            },
            packageJSON : {
                src : 'package.json',
                dest : 'build/package.json'
            },
            README : {
                src : '../README.md',
                dest : 'build/README.md'
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
                        "jqm" :         "../external/jquery.mobile-1.2.0",
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
                        "jqm" :         "../external/jquery.mobile-1.2.0",
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
                        "jqm" :          "../external/jquery.mobile-1.2.0",
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
        }
    });

    // Default task.
    grunt.registerTask('default', 'jshint');
    grunt.registerTask('build:mobile', [ 'jshint', 'clean:build', 'copy', 'requirejs:mobile', 'imageEmbed:mobile', 'preprocess:mobile', 'clean:post-mobile' ]);
    grunt.registerTask('build:web', [ 'jshint', 'clean:build', 'copy', 'requirejs:web', 'imageEmbed:web', 'preprocess:web', 'clean:post-web' ]);
    grunt.registerTask('build:demo', [ 'jshint', 'clean:build', 'copy', 'requirejs:demo', 'imageEmbed:web', 'preprocess:web', 'clean:post-web' ]);
};
