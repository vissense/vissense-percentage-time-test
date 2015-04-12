/*! { "name": "vissense-percentage-time-test", "version": "0.3.0", "copyright": "(c) 2015 tbk" } */
!function(root, factory) {
    "use strict";
    factory(root, root.VisSense, root.VisSense.Utils);
}(this, function(window, VisSense, VisSenseUtils, undefined) {
    "use strict";
    var createInnerMonitor = function(outerMonitor, callback, config) {
        var timeElapsed = 0, timeStarted = null, timeLimit = config.timeLimit, percentageLimit = config.percentageLimit, interval = config.interval;
        return outerMonitor.visobj().monitor({
            strategy: new VisSense.VisMon.Strategy.PollingStrategy({
                interval: interval
            }),
            update: function(monitor) {
                var percentage = monitor.state().percentage;
                if (percentageLimit > percentage) timeStarted = null; else {
                    var now = VisSenseUtils.now();
                    timeStarted = timeStarted || now, timeElapsed = now - timeStarted;
                }
                timeElapsed >= timeLimit && (monitor.stop(), outerMonitor.stop(), callback());
            },
            stop: function() {
                timeStarted = null;
            }
        });
    }, onPercentageTimeTestPassed = function(element, callback, config) {
        var _config = VisSenseUtils.defaults(config, {
            percentageLimit: 1,
            timeLimit: 1e3,
            interval: 100,
            strategy: undefined
        }), hiddenLimit = Math.max(_config.percentageLimit - .01, 0), innerMonitor = null, outerMonitor = new VisSense(element, {
            hidden: hiddenLimit
        }).monitor({
            strategy: _config.strategy,
            visible: function(monitor) {
                null === innerMonitor && (innerMonitor = createInnerMonitor(monitor, callback, _config)), 
                innerMonitor.start();
            },
            hidden: function() {
                null !== innerMonitor && innerMonitor.stop();
            },
            stop: function() {
                null !== innerMonitor && innerMonitor.stop();
            }
        });
        return outerMonitor.start(), function() {
            outerMonitor.stop(), innerMonitor = null;
        };
    }, on50_1TestPassed = function(element, callback, config) {
        return onPercentageTimeTestPassed(element, callback, VisSenseUtils.extend(config || {}, {
            percentageLimit: .5,
            timeLimit: 1e3,
            interval: 100
        }));
    };
    VisSense.fn.onPercentageTimeTestPassed = function(callback, config) {
        onPercentageTimeTestPassed(this.element(), callback, config);
    }, VisSense.fn.on50_1TestPassed = function(callback, config) {
        on50_1TestPassed(this.element(), callback, config);
    }, VisSense.VisMon.Strategy.PercentageTimeTestEventStrategy = function(options) {
        var registerPercentageTimeTestHook = function(monitor, percentageTimeTestConfig) {
            var config = VisSenseUtils.defaults(percentageTimeTestConfig, {
                eventName: "percentage-time-test-passed"
            }), cancelTest = VisSenseUtils.noop, unregisterVisibleHook = monitor.on("visible", VisSenseUtils.once(function(monitor) {
                cancelTest = onPercentageTimeTestPassed(monitor.visobj().element(), function() {
                    var report = {
                        monitorState: monitor.state(),
                        testConfig: config
                    };
                    monitor.publish(config.eventName, [ monitor, report ]);
                }, percentageTimeTestConfig), unregisterVisibleHook();
            }));
            return function() {
                unregisterVisibleHook(), cancelTest();
            };
        }, cancel = VisSenseUtils.noop;
        return {
            init: function(monitor) {
                cancel = registerPercentageTimeTestHook(monitor, options);
            },
            stop: function() {
                cancel();
            }
        };
    };
});