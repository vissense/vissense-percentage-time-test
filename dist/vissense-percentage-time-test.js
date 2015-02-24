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
            stop: function() {}
        });
    };
    VisSense.fn.onPercentageTimeTestPassed = function(callback, config) {
        var _config = VisSenseUtils.defaults(config, {
            percentageLimit: 1,
            timeLimit: 1e3,
            interval: 100,
            strategy: undefined
        }), inner = {
            monitor: null
        }, outerMonitor = new VisSense(this.element(), {
            hidden: _config.percentageLimit - .01
        }).monitor({
            strategy: _config.strategy,
            update: function(monitor) {},
            fullyvisible: function() {},
            visible: function(monitor) {
                null === inner.monitor && (inner.monitor = createInnerMonitor(monitor, callback, _config)), 
                inner.monitor.start();
            },
            hidden: function() {
                null !== inner.monitor && inner.monitor.stop();
            },
            stop: function() {
                null !== inner.monitor && inner.monitor.stop();
            }
        });
        return outerMonitor.start(), function() {
            outerMonitor.stop();
        };
    }, VisSense.fn.on50_1TestPassed = function(callback, config) {
        return this.onPercentageTimeTestPassed(callback, VisSenseUtils.extend(config || {}, {
            percentageLimit: .5,
            timeLimit: 1e3,
            interval: 100
        }));
    };
});