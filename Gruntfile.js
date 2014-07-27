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

        dirs :{
            coverage: './bin/coverage'
        },

        concat: {
            options: {
                banner: '<%= banner %>',
                stripBanners: true
            },
            dist: {
                src: [
                    'src/main/plugin/percentage_time_test/vissense.plugin.percentage_time_test.js',
                    'src/main/plugin/percentage_time_test/vissense.plugin.50_1_test.js'
                ],
                dest: 'dist/vissense.plugin.percentage-time-test.js'
            }
        },
        uglify: {
            options: {
                banner: '<%= banner %>'
            },
            dist: {
                src: '<%= concat.dist.dest %>',
                dest: 'dist/vissense.plugin.percentage-time-test.min.js'
            }
        },
        jshint: {
            options: {
                jshintrc:true
            },
            gruntfile: {
                src: 'Gruntfile.js'
            },
            karma: {
                src: 'karma.conf.js'
            },
            src_test: {
                src: ['src/**/*.js', 'spec/**/*.js']
            }
        },
        qunit: {
            files: [
                'src/test/**/*.html'
            ]
        },

        jasmine: {
            coverage: {
                src: [
                    'src/main/plugin/percentage_time_test/vissense.plugin.percentage_time_test.js',
                    'src/main/plugin/percentage_time_test/vissense.plugin.50_1_test.js'
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
                        'bower_components/againjs/dist/againjs.min.js',
                        'bower_components/vissense/dist/vissense.min.js',
                        'bower_components/vissense-monitor/dist/vissense-monitor.min.js',
                        'bower_components/vissense-timer/dist/vissense-timer.min.js'
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
                                type: 'cobertura',
                                options: {
                                    dir: '<%= dirs.coverage %>/cobertura'
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
                commitFiles: ['package.json', 'bower.json'],
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
    grunt.loadNpmTasks('grunt-bump');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-karma');

    grunt.loadNpmTasks('grunt-notify');

    grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'test', 'notify:js']);

    grunt.registerTask('serve', ['default', 'watch']);
    grunt.registerTask('test', ['connect', 'jasmine', 'karma', 'qunit','notify:test']);
};

