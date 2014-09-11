/*global $,VisSense,describe,it,expect,jasmine*/
/**
 * @license
 * Vissense <http://vissense.com/>
 * Copyright 2014 tbk <theborakompanioni+vissense@gmail.com>
 * Available under MIT license <http://opensource.org/licenses/MIT>
 */
describe('VisSensePluginPercentageTimeTest', function() {
    'use strict';

   describe('vissense-plugin-percentage-time-test.js async', function() {

       it('should check that the 50/1 test passes', function (done) {
           jasmine.getFixtures().set('<div id="element" style="width: 1px; height: 1px;"></div>');
           var visobj = new VisSense($('#element')[0]);
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
               expect(duration).toBeLessThan(1099);

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
           }, 1200);
       });

   });

});
