/*! { "name": "vissense-plugin-percentage-time-test", "version": "0.1.3", "copyright": "(c) 2014 tbk" } */
;(function(window, VisSense, undefined) {
'use strict';
VisSense.fn.onPercentageTimeTestPassed = function(percentageLimit, timeLimit, callback, timeoutInterval) {
    var timeElapsed = 0;
    var timeStarted = null;
    var interval = timeoutInterval >= 100 ? timeoutInterval : timeoutInterval === undefined ? 1000 : 100;

    this.monitor({
        update: function(monitor) {
            var percentage = monitor.status().percentage();
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
                setTimeout(function() {
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
})(window, window.VisSense);