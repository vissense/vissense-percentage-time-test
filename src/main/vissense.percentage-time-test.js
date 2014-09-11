
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
    var timeElapsed = 0;
    var timeStarted = null;

    var onUpdate = function() {
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
            }, 100);
        }
    };

    var monitor = this.monitor({
        strategy: new VisSense.VisMon.Strategy.NoopStrategy(),
        update: onUpdate
    });

    monitor.start();
};

/**
* This function invokes a callback if and only if
* the element has been visible at least 50 percent
* for at least 1 second.
*/
VisSense.fn.on50_1TestPassed = function(callback) {
    this.onPercentageTimeTestPassed(0.5, 1000, callback);
};