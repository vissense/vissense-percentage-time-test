/*global $,VisSense,describe,it,xit,expect,jasmine,beforeEach,spyOn,afterEach*/
/**
 * @license
 * Vissense <http://vissense.com/>
 * Copyright 2014 tbk <theborakompanioni+vissense@gmail.com>
 * Available under MIT license <http://opensource.org/licenses/MIT>
 */
describe('VisSensePluginPercentageTimeTest', function () {
  'use strict';
  xit('is a placeholder to satisfy jshint when no test is actually ignored');

  function fireScrollEvent() {
    var event = document.createEvent('Event');
    event.initEvent('scroll', true, true);
    window.dispatchEvent(event);
  }

  function showHide(element, config) {
    expect(config.show > 0).toBe(true);
    expect(config.hide > 0).toBe(true);

    setTimeout(function () {
      element.style.display = 'block';
      fireScrollEvent();
      console.log('[showHide] element -> visible');
    }, config.show);

    setTimeout(function () {
      element.style.display = 'none';
      fireScrollEvent();
      console.log('[showHide] element -> hidden');
    }, config.hide);
  }

  function jumpToFixedPositionAndBack(element, leftInPixel, config) {
    expect(config.jump > 0).toBe(true);
    expect(config.jumpBack > 0).toBe(true);

    var formerPosition = element.style.position;
    var formerLeft = element.style.left;
    var formerTop = element.style.top;

    setTimeout(function () {
      element.style.position = 'fixed';
      element.style.top = '0';
      element.style.left = leftInPixel + 'px';
      console.log('[jumpToFixedPositionAndBack] jumped to fixed position -> hidden');
      fireScrollEvent();
    }, config.jump);

    setTimeout(function () {
      element.style.display = formerPosition;
      element.style.left = formerLeft;
      element.style.top = formerTop;
      console.log('[jumpToFixedPositionAndBack] jumped back to normal position -> visible');
      fireScrollEvent();
    }, config.jumpBack);
  }


  describe('vissense-plugin-percentage-time-test.js async', function () {
    var visobj, observer;

    beforeEach(function () {
      jasmine.getFixtures().set('<div id="element" style="width: 1px; height: 1px;"></div>');
      visobj = new VisSense($('#element')[0]);

      observer = {callback: VisSense.Utils.noop};
      spyOn(observer, 'callback');

      jasmine.clock().install();

      jasmine.clock().mockDate();
    });

    afterEach(function () {
      jasmine.clock().uninstall();
    });

    it('should verify that default check interval is 100ms', function () {
      visobj.onPercentageTimeTestPassed(function () {
        observer.callback();
      }, {
        percentageLimit: 0.5,
        timeLimit: 1000
      });

      jasmine.clock().tick(999);
      expect(observer.callback).not.toHaveBeenCalled();

      jasmine.clock().tick(1);
      expect(observer.callback.calls.count()).toEqual(1);

    });

    it('should check that the 50/1 test does NOT pass on hidden elements', function () {
      jasmine.getFixtures().set('<div id="element" style="display:none;"></div>');
      var visobj = new VisSense($('#element')[0]);

      visobj.on50_1TestPassed(function () {
        observer.callback();
      });

      jasmine.clock().tick(1);

      jasmine.clock().tick(99999);

      expect(observer.callback).not.toHaveBeenCalled();
    });

    it('should check that the 50/1 test passes on visible elements', function () {
      visobj.on50_1TestPassed(function () {
        observer.callback();
      });

      jasmine.clock().tick(999);

      expect(observer.callback).not.toHaveBeenCalled();

      jasmine.clock().tick(2);

      expect(observer.callback.calls.count()).toEqual(1);
    });

    it('should check that the 50/1 test does NOT pass when element becomes hidden before time limit has been reached', function () {
      jasmine.getFixtures().set('<div id="element" style="width: 10px; height: 10px; display:none;"></div>');
      var visobj = new VisSense($('#element')[0]);

      visobj.on50_1TestPassed(function () {
        observer.callback();
      });

      // show and hide the element in under a second
      showHide($('#element')[0], {
        show: 1,
        hide: 999
      });

      jasmine.clock().tick(200);
      expect(observer.callback).not.toHaveBeenCalled();

      // if we'd tick 1500 at once, than the callback would be triggered..
      jasmine.clock().tick(300);
      jasmine.clock().tick(300);
      jasmine.clock().tick(300);
      jasmine.clock().tick(300);

      expect(observer.callback).not.toHaveBeenCalled();
    });

    it('should check that the 50/1 test does NOT pass when elements visibility ' +
    'falls below percentage limit before time limit has been reached', function () {
      jasmine.getFixtures().set('<div id="element" style="width: 10px; height: 10px;"></div>');
      var visobj = new VisSense($('#element')[0]);

      var start = Date.now();
      var testOuterMonitor = null;
      visobj.on50_1TestPassed(function () {
        observer.callback();
      }, {
        strategy: [
          new VisSense.VisMon.Strategy.PollingStrategy({interval: 100}), {
            start: function (monitor) {
              console.log('monitor started: begin 50/1 test');
              testOuterMonitor = monitor;
            },
            stop: function () {
              console.log('monitor stopped - end 50/1 test');
            }
          }]
      });

      expect(testOuterMonitor.state().visible).toBe(true);
      console.log('time elapsed ' + (Date.now() - start));

      var leftInPixel = '-9';
      jumpToFixedPositionAndBack($('#element')[0], leftInPixel, {
        jump: 1,
        jumpBack: 999
      });

      jasmine.clock().tick(1);

      expect(testOuterMonitor.state().visible).toBe(true);
      console.log('time elapsed ' + (Date.now() - start));

      jasmine.clock().tick(98);
      expect(testOuterMonitor.state().visible).toBe(true);
      console.log('time elapsed ' + (Date.now() - start));

      jasmine.clock().tick(1);

      // element jumps to fixed position -> monitor is "hidden"
      expect(testOuterMonitor.state().visible).toBe(false);
      console.log('time elapsed ' + (Date.now() - start));

      jasmine.clock().tick(899);

      expect(testOuterMonitor.state().visible).toBe(false);
      console.log('time elapsed ' + (Date.now() - start));

      expect(observer.callback).not.toHaveBeenCalled();

      jasmine.clock().tick(1);

      // jump back to original position -> monitor is "visible"
      expect(testOuterMonitor.state().visible).toBe(true);
      console.log('time elapsed ' + (Date.now() - start));

      expect(observer.callback).not.toHaveBeenCalled();

      jasmine.clock().tick(300);
      jasmine.clock().tick(300);
      jasmine.clock().tick(300);

      expect(observer.callback).not.toHaveBeenCalled();

      jasmine.clock().tick(300);

      expect(observer.callback.calls.count()).toEqual(1);
    });


    it('should check that the 50/1 test does pass when an initial VISIBLE element ' +
    'becomes hidden after limit has been reached', function () {
      jasmine.getFixtures().set('<div id="element" style="width: 10px; height: 10px;"></div>');
      var visobj = new VisSense($('#element')[0]);

      var start = Date.now();
      var testOuterMonitor = null;
      visobj.on50_1TestPassed(function () {
        observer.callback();
      }, {
        strategy: [
          new VisSense.VisMon.Strategy.PollingStrategy({interval: 10}), {
            start: function (monitor) {
              console.log('monitor started: begin 50/1 test');
              testOuterMonitor = monitor;
            },
            stop: function () {
              console.log('monitor stopped - end 50/1 test');
            }
          }]
      });

      // show and hide the element in over a second
      showHide($('#element')[0], {
        show: 1,
        hide: 1100
      });

      expect(testOuterMonitor.state().visible).toBe(true);
      console.log('time elapsed ' + (Date.now() - start));

      jasmine.clock().tick(1); // element gets visible
      jasmine.clock().tick(9); // monitor notices the change - 1 second from now on
      console.log('time elapsed ' + (Date.now() - start));

      expect(testOuterMonitor.state().visible).toBe(true);

      jasmine.clock().tick(989);
      console.log('time elapsed ' + (Date.now() - start));

      expect(testOuterMonitor.state().visible).toBe(true);
      expect(observer.callback).not.toHaveBeenCalled(); // 999ms elapsed

      jasmine.clock().tick(2); // test is passed

      console.log('time elapsed ' + (Date.now() - start));

      expect(observer.callback.calls.count()).toEqual(1);

      jasmine.clock().tick(100); // element got hidden
      jasmine.clock().tick(100);
      jasmine.clock().tick(100);

      // WHY THE FUCK IS THE MONITOR HERE VISIBLE?
      // -> expect(testOuterMonitor.state().visible).toBe(true);

      expect(observer.callback.calls.count()).toEqual(1);
    });

    it('should check that the 50/1 test does pass when an initial HIDDEN element ' +
    'becomes hidden after limit has been reached', function () {
      jasmine.getFixtures().set('<div id="element" style="width: 10px; height: 10px; display:none;"></div>');
      var visobj = new VisSense($('#element')[0]);

      var testOuterMonitor = null;
      visobj.on50_1TestPassed(function () {
        observer.callback();
      }, {
        strategy: [
          new VisSense.VisMon.Strategy.PollingStrategy({interval: 1}), {
            start: function (monitor) {
              console.log('monitor started: begin 50/1 test');
              testOuterMonitor = monitor;
            },
            stop: function () {
              console.log('monitor stopped - end 50/1 test');
            }
          }]
      });

      // show and hide the element in over a second
      showHide($('#element')[0], {
        show: 1,
        hide: 1010
      });

      var start = Date.now();

      expect(testOuterMonitor.state().visible).toBe(false);

      jasmine.clock().tick(1); // element gets visible
      jasmine.clock().tick(1); // monitor notices the change - 1 second from now on

      expect(testOuterMonitor.state().visible).toBe(true);

      jasmine.clock().tick(999);

      expect(testOuterMonitor.state().visible).toBe(true);

      jasmine.clock().tick(1);

      expect(observer.callback.calls.count()).toEqual(1);

      console.log('time elapsed ' + (Date.now() - start));

    });

    it('WITH STRATEGY: should check that the 50/1 test does NOT pass when elements visibility ' +
    'falls below percentage limit before time limit has been reached', function () {
      jasmine.getFixtures().set('<div id="element" style="width: 10px; height: 10px;"></div>');

      var start = Date.now();

      var testOuterMonitor = VisSense.VisMon.Builder(new VisSense($('#element')[0], {
        hidden: 0.499
      }))
        .strategy(new VisSense.VisMon.Strategy.PollingStrategy({interval: 100}))
        .strategy({
          start: function () {
            console.log('monitor started: begin 50/1 test');
          },
          stop: function () {
            console.log('monitor stopped - end 50/1 test');
          }
        })
        .strategy(new VisSense.VisMon.Strategy.PercentageTimeTestEventStrategy('ptt-50/1-passed', {
          interval: 100,
          percentageLimit: 0.5,
          timeLimit: 1000
        }))
        .on('ptt-50/1-passed', function (monitor, data) {
          observer.callback(data);
          testOuterMonitor.stop();
        })
        .build();

      testOuterMonitor.start();

      var leftInPixel = '-9';
      jumpToFixedPositionAndBack($('#element')[0], leftInPixel, {
        jump: 1,
        jumpBack: 999
      });

      expect(testOuterMonitor.state().visible).toBe(true);
      console.log('time elapsed ' + (Date.now() - start));

      jasmine.clock().tick(100);

      // element jumps to fixed position -> monitor is "hidden"
      expect(testOuterMonitor.state().visible).toBe(false);
      console.log('time elapsed ' + (Date.now() - start));

      jasmine.clock().tick(899);

      expect(testOuterMonitor.state().visible).toBe(false);
      console.log('time elapsed ' + (Date.now() - start));

      expect(observer.callback).not.toHaveBeenCalled();

      jasmine.clock().tick(1);

      // jump back to original position -> monitor is "visible"
      expect(testOuterMonitor.state().visible).toBe(true);
      console.log('time elapsed ' + (Date.now() - start));

      expect(observer.callback).not.toHaveBeenCalled();

      jasmine.clock().tick(300);
      jasmine.clock().tick(300);
      jasmine.clock().tick(300);

      expect(observer.callback).not.toHaveBeenCalled();

      jasmine.clock().tick(300);

      expect(observer.callback.calls.count()).toEqual(1);

    });

  });

});
