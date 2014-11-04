/**
 * @license
 * Available under MIT license <http://opensource.org/licenses/MIT>
 */
 ;(function (root, factory) {
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
    * @doc method
    * @name VisSense:onPercentageTimeTestPassed
    *
    * @param {Number} percentageLimit Percentage limit between 0 and 1
    * @param {Number} timeLimit Time limit in milliseconds
    * @param {Function} callback The function to call when the condition is fulfilled
    * @param {Number} timeoutInterval Time in milliseconds between checks (default: 1000, min: 100)
    *
    * @returns {undefined}
    *
    * @description
    * This function invokes a callback if and only if the element has been visible at least
    * ´percentageLimit´ percent for at least ´timeLimit´ milliseconds.
    *
    * Important: Every invocation starts a new test! This means the callback will not be called 
    * for at least ´timeLimit´ milliseconds.
    *
    * If not provided, the check interval defaults to 1000 ms.
    */
    VisSense.fn.onPercentageTimeTestPassed = function(percentageLimit, timeLimit, callback, timeoutInterval) {
        var timeElapsed = 0;
        var timeStarted = null;
        var interval = timeoutInterval >= 100 ? timeoutInterval : timeoutInterval === undefined ? 1000 : 100;
        var innerMonitor = null;
        var timeoutId = null;

        var outerMonitor = this.monitor({
            strategy: new VisSense.VisMon.Strategy.EventStrategy({ debounce: 30 }),
            visible: function() {
                innerMonitor = (innerMonitor || outerMonitor.visobj().monitor({
                    update: function() {
                        var percentage = innerMonitor.state().percentage;
                        if (percentage < percentageLimit) {
                            timeStarted = null;
                        } else {
                            var now = VisSense.Utils.now();
                            timeStarted = timeStarted || now;
                            timeElapsed = now - timeStarted;
                        }

                        if (timeElapsed >= timeLimit) {
                            clearTimeout(timeoutId);
                            outerMonitor.stop();
                            callback();
                        } else {
                            timeoutId = setTimeout(function() {
                                innerMonitor.update();
                            }, interval);
                        }
                    }
                }));

                innerMonitor.start();
            },
            hidden: function() {
                clearTimeout(timeoutId);
            }
        });

        outerMonitor.start();
    };

    /**
    * @doc method
    * @name VisSense:onPercentageTimeTestPassed
    *
    * @param {Function} callback The function to call when the condition is fulfilled
    *
    * @returns {undefined}
    *
    * @description
    * This function invokes a callback if and only if the element has been visible at least 
    * 50 percent for at least 1 second. It checks the visibility in 100ms intervals.
    */
    VisSense.fn.on50_1TestPassed = function(callback) {
        this.onPercentageTimeTestPassed(0.5, 1000, callback, 100);
    };

}));