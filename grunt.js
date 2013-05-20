/*global module:false*/
module.exports = function(grunt) {
  "use strict";

  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks("grunt-image-embed");
  grunt.loadNpmTasks('grunt-rm');
  grunt.loadNpmTasks('grunt-preprocess');
  grunt.loadNpmTasks('grunt-zipstream');
  grunt.loadNpmTasks('grunt-clean');

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    lint: {
      all: ['src/routes/*.js', 'src/util/*.js', 'src/*.js', 'src/public/scripts/**']
    },

    // js linting options
    jshint : {
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
        nomen : false
      },
      globals : {
        require : true,
        define : true,
        $ : true,
        alert : true,
        console : true,
        module : true,
        process : true,
        __dirname : true
      }
    },

    clean: {
      folder: "build"
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
      compile: {
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

    rm: {
      'embedded-images' : ['build/src/public/skins/*/gfx/**']
    },

    zip: {
      foobar: {
        src: 'build/**',
        dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.zip',
        base: 'build',
        subdir: 'node-jukebox'
      }
    }
  });

  // Default task.
  grunt.registerTask('default', 'lint');
  grunt.registerTask('build', 'lint clean copy requirejs imageEmbed preprocess rm');
  grunt.registerTask('package', 'lint clean copy requirejs imageEmbed preprocess rm zip');
};
