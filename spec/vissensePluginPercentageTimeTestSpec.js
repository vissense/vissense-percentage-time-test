/*global $,VisSense,describe,it,expect,jasmine,beforeEach,spyOn,afterEach*/
/**
 * @license
 * Vissense <http://vissense.com/>
 * Copyright 2014 tbk <theborakompanioni+vissense@gmail.com>
 * Available under MIT license <http://opensource.org/licenses/MIT>
 */
describe('VisSensePluginPercentageTimeTest', function() {
  'use strict';

  function fireScrollEvent() {
      var event = document.createEvent('Event');
      event.initEvent('scroll', true, true);
      window.dispatchEvent(event);
  }

  function showHide(element, show, hide) {
    setTimeout(function() {
        element.style.display = 'block';
        fireScrollEvent();
    }, show);

    setTimeout(function() {
        element.style.display = 'none';
        fireScrollEvent();
    }, hide);
  }


  describe('vissense-plugin-percentage-time-test.js async', function() {
    var visobj, observer;

    beforeEach(function() {
      jasmine.getFixtures().set('<div id="element" style="width: 1px; height: 1px;"></div>');
      visobj = new VisSense($('#element')[0]);

      observer = { callback: VisSense.Utils.noop };
      spyOn(observer, 'callback');

       jasmine.clock().install();

       jasmine.clock().mockDate();
   });

   afterEach(function() {
       jasmine.clock().uninstall();
   });

    it('should verify that default check interval is 100ms', function () {
      visobj.onPercentageTimeTestPassed(function() {
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

      visobj.on50_1TestPassed(function() {
          observer.callback();
      });

      jasmine.clock().tick(99999);
      expect(observer.callback).not.toHaveBeenCalled();
    });

    it('should check that the 50/1 test passes on visible elements', function () {
      visobj.on50_1TestPassed(function() {
          observer.callback();
      });

      jasmine.clock().tick(999);

      expect(observer.callback).not.toHaveBeenCalled();

      jasmine.clock().tick(3000);

      expect(observer.callback.calls.count()).toEqual(1);
    });

    it('should check that the 50/1 test does NOT pass when element becomes hidden before limit has been reached', function () {
      jasmine.getFixtures().set('<div id="element" style="width: 10px; height: 10px; display:none;"></div>');
      var visobj = new VisSense($('#element')[0]);

      visobj.on50_1TestPassed(function() {
          observer.callback();
      });

      // show and hide the element in under a second
      showHide($('#element')[0], 1, 999);

      jasmine.clock().tick(200);
      expect(observer.callback).not.toHaveBeenCalled();

      // if we'd tick 1500 at once, than the callback would be triggered..
      jasmine.clock().tick(300);
      jasmine.clock().tick(300);
      jasmine.clock().tick(300);
      jasmine.clock().tick(300);

      expect(observer.callback).not.toHaveBeenCalled();
    });

    it('should check that the 50/1 test does pass when element becomes hidden after limit has been reached', function () {
      jasmine.getFixtures().set('<div id="element" style="width: 10px; height: 10px; display:none;"></div>');
      var visobj = new VisSense($('#element')[0]);

      visobj.on50_1TestPassed(function() {
          observer.callback();
      });

      // show and hide the element in over a second
      showHide($('#element')[0], 1, 1010);
      jasmine.clock().tick(2); // shows the element

      jasmine.clock().tick(910);
      expect(observer.callback).not.toHaveBeenCalled();

      jasmine.clock().tick(10 + 1000); // VisSense default PollingStrategy interval is 1000ms

      expect(observer.callback.calls.count()).toEqual(1);

    });

  });

});
