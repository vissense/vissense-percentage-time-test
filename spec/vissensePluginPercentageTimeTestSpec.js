/*global $,VisSense,describe,it,expect,jasmine,beforeEach */
/**
 * @license
 * Vissense <http://vissense.com/>
 * Copyright 2014 tbk <theborakompanioni+vissense@gmail.com>
 * Available under MIT license <http://opensource.org/licenses/MIT>
 */
describe('VisSensePluginPercentageTimeTest', function() {
    'use strict';

    function fireScrollEvent() {
      //var event = new window.Event('scroll');
      //window.dispatchEvent(event);
      // Create the event.
      var event = document.createEvent('Event');

      // Define that the event name is 'build'.
      event.initEvent('scroll', true, true);

      // target can be any Element or other EventTarget.
      window.dispatchEvent(event);
    }

    fireScrollEvent();

   describe('vissense-plugin-percentage-time-test.js async', function() {
       var visobj;

       beforeEach(function() {
           jasmine.getFixtures().set('<div id="element" style="width: 1px; height: 1px;"></div>');
           visobj = new VisSense($('#element')[0]);
       });


       it('should verify that minimum check interval is 100ms', function (done) {
           var invocations = 0;

           visobj.onPercentageTimeTestPassed(1, 10, function() {
               invocations = 1;
           }, 1);

           setTimeout(function() {
               expect(invocations).toBe(0);
           }, 90);

           setTimeout(function() {
               expect(invocations).toBe(1);
               done();
           }, 399);
       });


       it('should verify that default check interval is 1000ms', function (done) {
           var invocations = 0;

           visobj.onPercentageTimeTestPassed(1, 10, function() {
               invocations = 1;
           });

           setTimeout(function() {
               expect(invocations).toBe(0);
           }, 999);

           setTimeout(function() {
               expect(invocations).toBe(1);
               done();
           }, 1999);
       });

       it('should check that the 50/1 test passes', function (done) {
           var invocations = 0;

           var now = Date.now();
           var duration = null;

           visobj.on50_1TestPassed(function() {
               invocations = 1;
               duration = Date.now() - now;
           });

           setTimeout(function() {
               expect(invocations).toBe(0);
           }, 999);

           setTimeout(function() {
               expect(invocations).toBe(1);

               expect(duration).toBeGreaterThan(999);
               expect(duration).toBeLessThan(1999);

               done();
           }, 3501);
       });

       it('should check that the 50/1 test does NOT pass on hidden elements', function (done) {
           jasmine.getFixtures().set('<div id="element" style="display:none;"></div>');
           var visobj = new VisSense($('#element')[0]);

           var invocations = 0;

           visobj.on50_1TestPassed(function() {
               invocations = 1;
           });

           setTimeout(function() {
               expect(invocations).toBe(0);
               done();
           }, 1999);
       });

       it('should check that the 50/1 test does NOT pass when element becomes hidden before limit has been reached', function (done) {
           jasmine.getFixtures().set('<div id="element" style="width: 10px; height: 10px; display:none;"></div>');
           var visobj = new VisSense($('#element')[0]);

           var invocations = 0;

           visobj.on50_1TestPassed(function() {
               invocations = 1;
           });

           setTimeout(function() {
               expect(invocations).toBe(0);
           }, 100);

           setTimeout(function() {
               $('#element')[0].style.display = 'block';
               fireScrollEvent();
           }, 200);

           setTimeout(function() {
               $('#element')[0].style.display = 'none';
               fireScrollEvent();
           }, 800);

           setTimeout(function() {
               expect(invocations).toBe(0);
               done();
           }, 1999);
       });

   });

});
