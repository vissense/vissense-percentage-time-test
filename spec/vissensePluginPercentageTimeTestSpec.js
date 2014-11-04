/*global $,VisSense,describe,it,expect,jasmine,beforeEach,spyOn */
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
    });
     
    it('should verify that default check interval is 1000ms', function (done) {
      visobj.onPercentageTimeTestPassed(function() {
          observer.callback();
      });

      setTimeout(function() {
          expect(observer.callback).not.toHaveBeenCalled();
      }, 999);

      setTimeout(function() {
          expect(observer.callback.calls.count()).toEqual(1);

          done();
      }, 1999);
    });

    it('should check that the 50/1 test does NOT pass on hidden elements', function (done) {
      jasmine.getFixtures().set('<div id="element" style="display:none;"></div>');
      var visobj = new VisSense($('#element')[0]);

      visobj.on50_1TestPassed(function() {
          observer.callback();
      });

      setTimeout(function() {
          expect(observer.callback).not.toHaveBeenCalled();

          done();
      }, 1999);
    });
     
    it('should check that the 50/1 test passes on visible elements', function (done) {
      var now = Date.now();
      var duration = null;

      visobj.on50_1TestPassed(function() {
          observer.callback();
          duration = Date.now() - now;
      });

      setTimeout(function() {
          expect(observer.callback).not.toHaveBeenCalled();
      }, 999);

      setTimeout(function() {
          expect(observer.callback.calls.count()).toEqual(1);

          expect(duration).toBeGreaterThan(999);
          expect(duration).toBeLessThan(1999);

          done();
      }, 3501);
    });

    it('should check that the 50/1 test does NOT pass when element becomes hidden before limit has been reached', function (done) {
      jasmine.getFixtures().set('<div id="element" style="width: 10px; height: 10px; display:none;"></div>');
      var visobj = new VisSense($('#element')[0]);

      visobj.on50_1TestPassed(function() {
          observer.callback();
      });

      // show and hide the element in under a second
      showHide($('#element')[0], 1, 999);

      setTimeout(function() {
          expect(observer.callback).not.toHaveBeenCalled();
      }, 199);

      setTimeout(function() {
          expect(observer.callback).not.toHaveBeenCalled();
          done();
      }, 1999);
    });

    it('should check that the 50/1 test does pass when element becomes hidden after limit has been reached', function (done) {
      jasmine.getFixtures().set('<div id="element" style="width: 10px; height: 10px; display:none;"></div>');
      var visobj = new VisSense($('#element')[0]);

      visobj.on50_1TestPassed(function() {
          observer.callback();
      });

      // show and hide the element in over a second
      showHide($('#element')[0], 1, 1199);

      setTimeout(function() {
          expect(observer.callback).not.toHaveBeenCalled();
      }, 199);

      setTimeout(function() {
          expect(observer.callback.calls.count()).toEqual(1);

          done();
      }, 1999);
    });

  });

});
