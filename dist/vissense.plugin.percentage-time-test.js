/*! { "name": "vissense-plugin-percentage-time-test", "version": "0.1.4", "copyright": "(c) 2014 tbk" } */;(function (root, factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        var VisSense = require('vissense');
        factory(root, VisSense);
    } else if (typeof exports === 'object') {
        factory(root, root.VisSense);
    } else {
        factory(root, root.VisSense);
    }

}(this, function (window, VisSense, undefined) {
    'use strict';
    /**
    * This function invokes a callback if and only if
    * the element has been visible at least ´percentageLimit´ percent
    * for at least ´timeLimit´ milliseconds.
    *
    * Important: Every invocation starts a new test! This means the callback will
    * not be called for at least ´timeLimit´ milliseconds.
    *
    * If not provided, the check interval defaults to 1000 ms.
    *
    * percentageLimit number     between 0 and 1
    * timeLimit       number     in milliseconds
    * callback        function   the function to call when condition fulfilled
    * timeoutInterval number     time in milliseconds between checks (default: 1000min: 100ms)
    */
    VisSense.fn.onPercentageTimeTestPassed = function(percentageLimit, timeLimit, callback, timeoutInterval) {
        var timeElapsed = 0;
        var timeStarted = null;
        var interval = timeoutInterval >= 100 ? timeoutInterval : timeoutInterval === undefined ? 1000 : 100;

        this.monitor({
            update: function(monitor) {
                var percentage = monitor.state().percentage;
                if(percentage < percentageLimit) {
                    timeStarted = null;
                } else {
                    var now = VisSense.Utils.now();
                    timeStarted = timeStarted || now;
                    timeElapsed = now - timeStarted;
                }

                if(timeElapsed >= timeLimit) {
                    callback();
                    monitor.stop();
                } else {
                    window.setTimeout(function() {
                        monitor.update();
                    }, interval);
                }
            }
        }).start();
    };

    /**
    * This function invokes a callback if and only if
    * the element has been visible at least 50 percent
    * for at least 1 second.
    */
    VisSense.fn.on50_1TestPassed = function(callback) {
        this.onPercentageTimeTestPassed(0.5, 1000, callback, 100);
    };

}));