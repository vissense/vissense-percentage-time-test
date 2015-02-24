/*global $,VisSense,describe,it,expect,jasmine,beforeEach,spyOn,afterEach*/
/**
 * @license
 * Vissense <http://vissense.com/>
 * Copyright 2014 tbk <theborakompanioni+vissense@gmail.com>
 * Available under MIT license <http://opensource.org/licenses/MIT>
 */
describe('VisSensePluginPercentageTimeTest', function () {
  'use strict';

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
    }, config.show);

    setTimeout(function () {
      element.style.display = 'none';
      fireScrollEvent();
    }, config.hide);
  }

  function jumpToFixedPositionAndBack(element, leftInPixel, show, hide) {
    var formPosition = element.style.position;
    var formerLeft = element.style.left;
    var formerTop = element.style.top;
    setTimeout(function () {
      element.style.position = 'fixed';
      element.style.top = '0';
      element.style.left = leftInPixel + 'px';
      fireScrollEvent();
    }, show);

    setTimeout(function () {
      element.style.display = formPosition;
      element.style.left = formerLeft;
      element.style.top = formerTop;
      fireScrollEvent();
    }, hide);
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

      jasmine.clock().tick(5000);
      expect(observer.callback.calls.count()).toEqual(1);

    });

    it('should check that the 50/1 test does NOT pass on hidden elements', function () {
      jasmine.getFixtures().set('<div id="element" style="display:none;"></div>');
      var visobj = new VisSense($('#element')[0]);

      visobj.on50_1TestPassed(function () {
        observer.callback();
      });

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

    it('should check that the 50/1 test does NOT pass when elements visbility ' +
       'falls below percentage limit before time limit has been reached', function () {
      jasmine.getFixtures().set('<div id="element" style="width: 10px; height: 10px;"></div>');
      var visobj = new VisSense($('#element')[0]);

      visobj.on50_1TestPassed(function () {
        observer.callback();
      });

      jasmine.clock().tick(200);

      var leftInPixel = '-9';
      jumpToFixedPositionAndBack($('#element')[0], leftInPixel, 1, 999);

      jasmine.clock().tick(200);
      expect(observer.callback).not.toHaveBeenCalled();

      // if we'd tick 1500 at once, than the callback would be triggered..
      jasmine.clock().tick(300);
      jasmine.clock().tick(300);
      jasmine.clock().tick(300);
      jasmine.clock().tick(300);

      expect(observer.callback).not.toHaveBeenCalled();
    });


    it('should check that the 50/1 test does pass when an initial VISIBLE element ' +
    'becomes hidden after limit has been reached', function () {
      jasmine.getFixtures().set('<div id="element" style="width: 10px; height: 10px;"></div>');
      var visobj = new VisSense($('#element')[0]);

      visobj.on50_1TestPassed(function () {
        observer.callback();
      });

      // show and hide the element in over a second
      showHide($('#element')[0], {
        show: 1,
        hide: 1010
      });

      expect(visobj.isVisible()).toBe(true);

      jasmine.clock().tick(998); // shortly before test should be passed

      expect(visobj.isVisible()).toBe(true);

      expect(observer.callback).not.toHaveBeenCalled();

      jasmine.clock().tick(2); // test should not be passed

      expect(visobj.isVisible()).toBe(true);

      expect(observer.callback.calls.count()).toEqual(1);

      jasmine.clock().tick(9);
      jasmine.clock().tick(99);
      jasmine.clock().tick(999);
      jasmine.clock().tick(9999);

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
        strategy: [new VisSense.VisMon.Strategy.PollingStrategy({ interval: 1 }), {
          start: function(monitor) {
            console.log('monitor started: begin 50/1 test');
            testOuterMonitor = monitor;
          },
          stop: function() {
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

  });

});
