/*! { "name": "vissense-plugin-percentage-time-test", "version": "0.1.0", "copyright": "(c) 2014 tbk" } */

 ;(function(window, VisSense, VisSenseUtils) {
    'use strict';

    /**
    * This function invokes a callback if and only if
    * the element has been visible at least ´percentageLimit´ percent
    * for at least ´timeLimit´ milliseconds.
    *
    * Important: Every invocation starts a new test! This means the callback will
    * not be called for at least ´timeLimit´ milliseconds.
    *
    * The initial check interval is 100 milliseconds.
    *
    * percentageLimit number     between 0 and 1
    * timeLimit       number     in milliseconds
    * callback        function   the function to call when condition fulfilled
    */
    VisSense.fn.onPercentageTimeTestPassed = function(percentageLimit, timeLimit, callback) {
        var me = this;
        var timer = me.timer({
            strategy: new VisSense.VisMon.Strategy.PollingStrategy({
                interval: 100
            })
        });

        var timeElapsed = 0;
        var timeStarted = null;

        var timerId = timer.every(100, 100, function(monitor) {
            if(monitor.percentage() < percentageLimit) {
                timeStarted = null;
            } else {
                timeStarted = timeStarted || Date.now();
                timeElapsed = VisSenseUtils.now() - timeStarted;

                if(timeElapsed >= timeLimit) {
                    callback();
                    // stop timer after test has passed
                    VisSenseUtils.defer(function() {
                        timer.stop(timerId);
                    });
                }
            }
        }, true);
    };

}(window, window.VisSense, window.VisSenseUtils));

 ;(function(window, VisSense) {
    'use strict';

    /**
    * This function invokes a callback if and only if
    * the element has been visible at least 50 percent
    * for at least 1 second.
    */
    VisSense.fn.on50_1TestPassed = function(callback) {
        this.onPercentageTimeTestPassed(0.5, 1000, callback);
    };

}(window, window.VisSense));