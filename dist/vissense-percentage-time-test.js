/*! { "name": "vissense-percentage-time-test", "version": "0.5.0", "copyright": "(c) 2015 tbk" } */
!function(root, factory) {
    "use strict";
    factory(root, root.VisSense, root.VisSense.Utils);
}(this, function(window, VisSense, VisSenseUtils, undefined) {
    "use strict";
    var createInnerMonitor = function(outerMonitor, callback, config) {
        var timeElapsed = 0, timeStarted = null, timeLimit = config.timeLimit, percentageLimit = config.percentageLimit, interval = config.interval;
        return VisSense.VisMon.Builder(outerMonitor.visobj()).strategy(new VisSense.VisMon.Strategy.PollingStrategy({
            interval: interval
        })).on("update", function(monitor) {
            var percentage = monitor.state().percentage;
            if (percentageLimit > percentage) timeStarted = null; else {
                var now = VisSenseUtils.now();
                timeStarted = timeStarted || now, timeElapsed = now - timeStarted;
            }
            timeElapsed >= timeLimit && (monitor.stop(), outerMonitor.stop(), callback(monitor));
        }).on("stop", function() {
            timeStarted = null;
        }).build();
    }, onPercentageTimeTestPassed = function(visobj, callback, config) {
        var _config = VisSenseUtils.defaults(config, {
            percentageLimit: 1,
            timeLimit: 1e3,
            interval: 100,
            strategy: undefined
        }), hiddenLimit = Math.max(_config.percentageLimit - .001, 0), innerMonitor = null, outerMonitor = VisSense.VisMon.Builder(new VisSense(visobj.element(), {
            hidden: hiddenLimit,
            referenceWindow: visobj.referenceWindow()
        })).set("strategy", _config.strategy).on("visible", function(monitor) {
            null === innerMonitor && (innerMonitor = createInnerMonitor(monitor, callback, _config)), 
            innerMonitor.start();
        }).on("hidden", function() {
            null !== innerMonitor && innerMonitor.stop();
        }).on("stop", function() {
            null !== innerMonitor && innerMonitor.stop();
        }).build();
        return outerMonitor.start(), function() {
            outerMonitor.stop(), innerMonitor = null;
        };
    };
    VisSense.fn.onPercentageTimeTestPassed = function(callback, config) {
        onPercentageTimeTestPassed(this, callback, config);
    }, VisSense.fn.on50_1TestPassed = function(callback, options) {
        var config = VisSenseUtils.extend(VisSenseUtils.defaults(options, {
            interval: 100
        }), {
            percentageLimit: .5,
            timeLimit: 1e3
        });
        onPercentageTimeTestPassed(this, callback, config);
    }, VisSense.VisMon.Strategy.PercentageTimeTestEventStrategy = function(eventName, options) {
        var registerPercentageTimeTestHook = function(monitor, percentageTimeTestConfig) {
            var cancelTest = VisSenseUtils.noop, unregisterVisibleHook = monitor.on("visible", VisSenseUtils.once(function(monitor) {
                cancelTest = onPercentageTimeTestPassed(monitor.visobj(), function(innerMonitor) {
                    var report = {
                        monitorState: innerMonitor.state(),
                        testConfig: percentageTimeTestConfig
                    };
                    monitor.update(), monitor.publish(eventName, [ monitor, report ]);
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