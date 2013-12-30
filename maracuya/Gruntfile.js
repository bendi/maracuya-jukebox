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
    pkg: '<json:package.json>',

    // js linting options
    jshint : {
      all: [
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
        indent: 4,
        node: true,
        devel: true,
        jquery: true,

        globals : {
            "cordova": true,
            "define": true,
            "_": true
        }
      },
    },

    clean: {
      build: "build",
      'embedded-images' : ['build/src/public/skins/*/gfx/**']
    },

    copy: {
      src: {
        src : "src/**",
        dest : "build/src/"
      },
      packageJSON: {
        src : 'package.json',
        dest : 'build/package.json'
      },
      README: {
        src : 'README.md',
        dest : 'build/README.md'
      }
    },

    requirejs: {
      app: {
        options: {
          appDir: "src/public",
          baseUrl: "scripts",
          dir: "build/src/public",
          paths: {
            "underscore": "../external/lodash-1.0.0-rc.3",
            "domReady": "../external/plugins/domReady-2.0.1",
            "jquery": "../external/jquery-1.8.3.min",
            "jqm": "../external/jquery.mobile-1.2.0",
            "editinplace": "../external/jquery.editinplace",
            "qr": "../external/jquery.qrcode.min",
            "app": "../app",
            "io" : "empty:"
          },
          removeCombined: true,
          shim: {
            jqm: {
              deps: ['jquery'],
              exports: 'jQuery.mobile'
            },
            editinplace: {
              deps: ['jquery']
            }
          },


          modules: [
            {
              name: "app"
            }
          ]
        }
      },
      demoApp: {
          options: {
            appDir: "src/public",
            baseUrl: "scripts",
            dir: "build/src/public",
            paths: {
              "underscore": "../external/lodash-1.0.0-rc.3",
              "domReady": "../external/plugins/domReady-2.0.1",
              "jquery": "../external/jquery-1.8.3.min",
              "jqm": "../external/jquery.mobile-1.2.0",
              "editinplace": "../external/jquery.editinplace",
              "qr": "../external/jquery.qrcode.min",
              "app": "demoApp",
            },
            removeCombined: true,
            shim: {
              jqm: {
                deps: ['jquery'],
                exports: 'jQuery.mobile'
              },
              editinplace: {
                deps: ['jquery']
              }
            },


            modules: [
              {
                name: "app"
              }
            ]
          }
        },
        mobile: {
            options: {
              appDir: "src/public",
              baseUrl: "scripts",
              dir: "build/src/mobile",
              paths: {
                "underscore": "../external/lodash-1.0.0-rc.3",
                "domReady": "../external/plugins/domReady-2.0.1",
                "jquery": "../external/jquery-1.8.3.min",
                "jqm": "../external/jquery.mobile-1.2.0",
                "editinplace": "../external/jquery.editinplace",
                "qr": "../external/jquery.qrcode.min",
                "app": "../../mobile/scripts/mobile",
                "io" : "../external/socket.io.min",
                "playlist": "../../mobile/scripts/playlist",
                "scanner": "../../mobile/scripts/scanner",
                "eventHandler": "../../mobile/scripts/eventHandler"
              },
              removeCombined: true,
              shim: {
                jqm: {
                  deps: ['jquery'],
                  exports: 'jQuery.mobile'
                },
                editinplace: {
                  deps: ['jquery']
                }
              },


              modules: [
                {
                  name: "app"
                }
              ]
            }
          }
    },

    preprocess : {
      index : {
        src : 'src/public/index.html',
        dest : 'build/src/public/index.html'
      },
      stream : {
        src : 'src/public/stream.html',
        dest : 'build/src/public/stream.html'
      }
    },

    imageEmbed: {
      dist: {
        src: [ "build/src/public/skins/lyric_show_player/style.css" ],
        dest: "build/src/public/skins/lyric_show_player/style.css"
      }
    },

    compress: {
      options: {
        archive: 'dist/<%= pkg.name %>-<%= pkg.version %>.zip'
      },
      main: {
        src: 'build/**',
        base: 'build',
        subdir: 'maracuya-jukebox'
      }
    }
  });

  // Default task.
  grunt.registerTask('default', 'jshint');
  grunt.registerTask('build', ['jshint', 'clean:build', 'copy', 'requirejs', 'imageEmbed', 'preprocess', 'clean:embedded-images']);
  grunt.registerTask('package', ['jshint', 'clean:build', 'copy', 'requirejs', 'imageEmbed', 'preprocess', 'clean:embedded-images', 'zip']);
};
