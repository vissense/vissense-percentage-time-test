module.exports = function(config) {
    'use strict';

    config.set({

        // base path, that will be used to resolve files and exclude
        basePath: './',

        frameworks: ['jasmine'],

        files: [
            'bower_components/jquery/dist/jquery.min.js',
            'bower_components/lodash/dist/lodash.min.js',
            'bower_components/jasmine-jquery/lib/jasmine-jquery.js',

            'bower_components/againjs/dist/againjs.min.js',

            'bower_components/vissense/dist/vissense.min.js',
            'bower_components/vissense-monitor/dist/vissense.monitor.min.js',
            'bower_components/vissense-timer/dist/vissense.timer.min.js',

            'src/main/plugin/percentage_time_test/vissense.plugin.percentage_time_test.js',
            'src/main/plugin/percentage_time_test/vissense.plugin.50_1_test.js',

            'spec/**/*.js',
            // fixtures
            {pattern: 'spec/**/*.html', watched: true, served: true, included: false}
        ],

        exclude: [
        ],

        reporters: ['progress', 'coverage'],

        port: 3000,

        colors: true,

        logLevel: config.LOG_INFO,

        autoWatch: true,

        preprocessors: {
          'src/main/**/*.js': ['coverage']
        },
 
        browsers: ['PhantomJS', 'Chrome'/*, 'Firefox', 'Opera'*/],
        //browsers: ['PhantomJS'],

        customLaunchers: {
          Chrome_without_security: {
            base: 'Chrome',
            flags: ['--disable-web-security']
          }
        },

        coverageReporter: {
            reporters:[
              {type: 'lcov', dir:'bin/coverage/'}
            ]
        },

        // If browser does not capture in given timeout [ms], kill it
        captureTimeout: 60000,
 
        // if true, it capture browsers, run tests and exit
        singleRun: true
    });
};