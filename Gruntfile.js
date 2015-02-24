module.exports = function (grunt) {
  'use strict';

  require('time-grunt')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! { ' +
    '"name": "<%= pkg.name %>", ' +
    '"version": "<%= pkg.version %>", ' +
    '<%= pkg.homepage ? "\\"homepage\\": \\"" + pkg.homepage + "\\"," : "" %>' +
    '"copyright": "(c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>" ' +
    '} */\n',
    dirs: {
      tmp: './tmp',
      dist: './dist',
      coverage: '<%= dirs.dist %>/coverage'
    },
    clean: {
      tmp: {
        src: ['<%= dirs.tmp %>']
      },
      dist: {
        src: ['<%= dirs.dist %>']
      }
    },
    concat: {
      tmp: {
        options: {
          stripBanners: true
        },
        src: [
          'lib/<%= pkg.name %>.js'
        ],
        dest: '<%= dirs.tmp %>/<%= pkg.name %>.js'
      }
    },
    umd: {
      all: {
        options: {
          src: '<%= concat.tmp.dest %>',
          dest: '<%= concat.tmp.dest %>',
          template: './templates/browser-vissense-percentage-time-test.hbs',
          indent: 2
        }
      }
    },
    uglify: {
      src: {
        options: {
          banner: '<%= banner %>',
          compress: {
            drop_console: true
          },
          sourceMap: false,
          preserveComments: false,
          beautify: true,
          mangle: false
        },
        src: '<%= concat.tmp.dest %>',
        dest: '<%= dirs.dist %>/<%= pkg.name %>.js'
      },
      dist: {
        options: {
          banner: '<%= banner %>',
          report: 'gzip',
          compress: {
            drop_console: true
          },
          sourceMap: false
        },
        src: '<%= concat.tmp.dest %>',
        dest: '<%= dirs.dist %>/<%= pkg.name %>.min.js'
      }
    },
    jshint: {
      options: {
        jshintrc: true
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      karma: {
        src: 'karma.conf.js'
      },
      src_test: {
        src: ['lib/**/*.js', 'spec/**/*.js']
      }
    },

    jasmine: {
      coverage: {
        src: [
          '<%= uglify.src.dest %>'
        ],
        options: {
          display: 'full',
          summary: true,
          specs: ['spec/*Spec.js'],
          helpers: [
            'spec/*Helper.js'
          ],
          vendor: [
            'bower_components/jquery/dist/jquery.min.js',
            'bower_components/lodash/dist/lodash.min.js',
            'bower_components/jasmine-jquery/lib/jasmine-jquery.js',
            'bower_components/vissense/dist/vissense.min.js'
          ],
          template: require('grunt-template-jasmine-istanbul'),
          templateOptions: {
            coverage: '<%= dirs.coverage %>/coverage.json',
            report: [{
              type: 'html',
              options: {
                dir: '<%= dirs.coverage %>/html'
              }
            }, {
              type: 'lcov',
              options: {
                dir: '<%= dirs.coverage %>/lcov'
              }
            }, {
              type: 'text-summary'
            }
            ]
          }
        }
      }
    },
    connect: {
      server: {
        options: {
          hostname: 'localhost',
          port: 3000,
          base: './'
        }
      }
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      src_test: {
        files: '<%= jshint.src_test.src %>',
        tasks: ['jshint:src_test', 'default']
      }
    },
    bump: {
      options: {
        files: ['package.json', 'bower.json'],
        updateConfigs: [],
        commit: true,
        commitMessage: 'release v%VERSION%',
        commitFiles: ['-a'],
        createTag: true,
        tagName: '%VERSION%',
        tagMessage: 'version %VERSION%',
        push: false,
        pushTo: 'upstream',
        gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d'
      }
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js'
      }
    },
    micro: {
      options: {
        limit: 1024
      },
      dist: {
        src: '<%= uglify.dist.dest %>'
      }
    },
    coveralls: {
      options: {
        force: true
      },
      target: {
        src: '<%= dirs.coverage %>/lcov/lcov.info'
      }
    },
    notify: {
      js: {
        options: {
          title: 'Javascript - <%= pkg.title %>',
          message: 'Minified and validated with success!'
        }
      },
      test: {
        options: {
          title: 'Javascript - <%= pkg.title %>',
          message: 'Tests successfully finished!'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-coveralls');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-micro');
  grunt.loadNpmTasks('grunt-notify');
  grunt.loadNpmTasks('grunt-umd');

  grunt.registerTask('dist', ['jshint', 'clean:tmp', 'concat:tmp', 'umd', 'clean:dist', 'uglify', 'clean:tmp']);
  grunt.registerTask('test', ['jasmine', 'karma', 'notify:test']);

  grunt.registerTask('test-fast', ['jasmine', 'notify:test']);

  grunt.registerTask('default', ['dist', 'test', 'micro', 'notify:js']);

  grunt.registerTask('serve', ['default', 'connect:server', 'watch']);

  grunt.registerTask('coverage', ['coveralls']);
};
