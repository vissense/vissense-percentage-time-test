/*global VisSense:true*/
/**
 * @license
 * Available under MIT license <http://opensource.org/licenses/MIT>
 */
'use strict';

/**
 * @doc method
 * @name VisSense:onPercentageTimeTestPassed
 *
 * @param {Function} callback The function to call when the condition is fulfilled
 * @param {Object} config Config object

 * @param {Number} config.percentageLimit Percentage limit between 0 and 1
 * @param {Number} config.timeLimit Time limit in milliseconds
 * @param {Number} config.interval Time in milliseconds between checks (default: 100)
 * @param {Number} config.debounce Time in milliseconds to debounce the update (e.g. when scrolling)
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
VisSense.fn.onPercentageTimeTestPassed = function(callback, config) {
  var _config = VisSense.Utils.defaults(config, {
    percentageLimit: 1,
    timeLimit: 1000,
    interval: 100,
    debounce: 30,
    strategy: undefined
  });

  var timeElapsed = 0;
  var timeStarted = null;
  var innerMonitor = null;
  var timeoutId = null;

  var outerMonitor = this.monitor({
    strategy: _config.strategy,
    visible: function() {
      innerMonitor = (innerMonitor || outerMonitor.visobj().monitor({
        strategy: [], // no strategy!
        update: function() {
          var percentage = innerMonitor.state().percentage;
          if (percentage < _config.percentageLimit) {
            timeStarted = null;
          } else {
            var now = VisSense.Utils.now();
            timeStarted = timeStarted || now;
            timeElapsed = now - timeStarted;
          }

          if (timeElapsed >= _config.timeLimit) {
            clearTimeout(timeoutId);
            outerMonitor.stop();

            callback();
          } else {
            timeoutId = setTimeout(function() {
              innerMonitor.update();
            }, _config.interval);
          }
        }
      }));

      innerMonitor.update();
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
 * @param {Object} config Config object
 *
 * @returns {undefined}
 *
 * @description
 * This function invokes a callback if and only if the element has been visible at least
 * 50 percent for at least 1 second. It checks the visibility in 100ms intervals.
 */
VisSense.fn.on50_1TestPassed = function(callback, config) {
  this.onPercentageTimeTestPassed(callback, VisSense.Utils.extend(config || {}, {
    percentageLimit: 0.5,
    timeLimit: 1000,
    debounce: 30,
    interval: 100
  }));
};
