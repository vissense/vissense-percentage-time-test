/*global VisSense:true, VisSenseUtils:true*/
'use strict';

var createInnerMonitor = function (outerMonitor, callback, config) {
  var timeElapsed = 0;
  var timeStarted = null;
  var timeLimit = config.timeLimit;
  var percentageLimit = config.percentageLimit;
  var interval = config.interval;

  return VisSense.VisMon.Builder(outerMonitor.visobj())
    .strategy(new VisSense.VisMon.Strategy.PollingStrategy({interval: interval}))
    .on('update', function (monitor) {
      console.log('[innerMonitor] update');

      var percentage = monitor.state().percentage;
      if (percentage < percentageLimit) {
        // start over if element falls below percentageLimit
        timeStarted = null;
        console.log('[innerMonitor] start again - under percentageLimit');
      } else {
        var now = VisSenseUtils.now();
        timeStarted = timeStarted || now;
        timeElapsed = now - timeStarted;
        console.log('[innerMonitor] time elapsed ' + timeElapsed);
      }

      if (timeElapsed >= timeLimit) {
        console.log('[innerMonitor] timeLimit reached! ' + timeLimit);

        monitor.stop();
        outerMonitor.stop();

        callback(monitor);
      }
    })
    .on('stop', function () {
      console.log('[innerMonitor] stop    - after ' + timeElapsed);
      timeStarted = null;
    }).build();
};

/**
 * @function
 * @name onPercentageTimeTestPassed
 *
 * @param {DOMElement} element A DOM element
 * @param {Function} callback The function to call when the condition is fulfilled
 * @param {Object} [config] Config object

 * @param {Number} [config.percentageLimit=1] Percentage limit between 0 and 1
 * @param {Number} [config.timeLimit=1000] Time limit in milliseconds
 * @param {Number} [config.interval=100] Time in milliseconds between checks (default: 100)
 * @param {Number} [config.strategy=undefined] Time in milliseconds to debounce the update (e.g. when scrolling)
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
var onPercentageTimeTestPassed = function (visobj, callback, config) {
  var _config = VisSenseUtils.defaults(config, {
    percentageLimit: 1,
    timeLimit: 1000,
    interval: 100,
    strategy: undefined
  });

  // monitor is considered hidden if it is 1% below the percentage limit
  var hiddenLimit = Math.max(_config.percentageLimit - 0.001, 0);

  var innerMonitor = null;

  var outerMonitor = VisSense.VisMon.Builder(new VisSense(visobj.element(), {
    hidden: hiddenLimit,
    referenceWindow: visobj.referenceWindow()
  }))
    .set('strategy', _config.strategy)
    .on('visible', function (monitor) {
      console.log('[outerMonitor.visible]');

      if (innerMonitor === null) {
        console.log('[outerMonitor.visible] create inner monitor');
        innerMonitor = createInnerMonitor(monitor, callback, _config);
      }
      console.log('[outerMonitor.visible] start inner monitor');
      innerMonitor.start();
    })
    .on('hidden', function () {
      console.log('[outerMonitor.hidden] hidden');
      if (innerMonitor !== null) {
        console.log('[outerMonitor.hidden] stop inner monitor');
        innerMonitor.stop();
      }
    })
    .on('stop', function () {
      if (innerMonitor !== null) {
        console.log('[outerMonitor.stop] stop inner monitor');
        innerMonitor.stop();
      }
    })
    .build();

  outerMonitor.start();

  return function () {
    console.log('[onPercentageTimeTestPassed] cancel');
    outerMonitor.stop();
    innerMonitor = null;
  };
};


/**
 * @method
 * @name onPercentageTimeTestPassed
 * @memberof VisSense#
 *
 * @deprecated use PercentageTimeTestEventStrategy instead
 */
VisSense.fn.onPercentageTimeTestPassed = function (callback, config) {
  onPercentageTimeTestPassed(this, callback, config);
};

/**
 * @method
 * @name on50_1TestPassed
 * @memberof VisSense#
 *
 * @deprecated use PercentageTimeTestEventStrategy instead
 *
 * @param {Function} callback The function to call when the condition is fulfilled
 * @param {Object} [options] Config object
 *
 * @returns {undefined}
 *
 * @description
 * This function invokes a callback if and only if the element has been visible at least
 * 50 percent for at least 1 second. It checks the visibility in 100ms intervals.
 */
VisSense.fn.on50_1TestPassed = function (callback, options) {
  var config = VisSenseUtils.extend(VisSenseUtils.defaults(options, {
    interval: 100
  }), {
    percentageLimit: 0.5,
    timeLimit: 1000
  });

  onPercentageTimeTestPassed(this, callback, config);
};

VisSense.VisMon.Strategy.PercentageTimeTestEventStrategy = function (eventName, options) {
  var registerPercentageTimeTestHook = function (monitor, percentageTimeTestConfig) {
    var cancelTest = VisSenseUtils.noop;
    var unregisterVisibleHook = monitor.on('visible', VisSenseUtils.once(function (monitor) {
      cancelTest = onPercentageTimeTestPassed(monitor.visobj(), function (innerMonitor) {
        var report = {
          monitorState: innerMonitor.state(),
          testConfig: percentageTimeTestConfig
        };
        monitor.update();

        monitor.publish(eventName, [monitor, report]);
      }, percentageTimeTestConfig);

      unregisterVisibleHook();
    }));

    return function () {
      unregisterVisibleHook();
      cancelTest();
    };
  };

  var cancel = VisSenseUtils.noop;

  return {
    init: function (monitor) {
      console.debug('[PercentageTimeTestEventStrategy] init');
      cancel = registerPercentageTimeTestHook(monitor, options);
    },
    stop: function () {
      cancel();
      console.debug('[PercentageTimeTestEventStrategy] stop');
    }
  };
};
