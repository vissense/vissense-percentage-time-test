/*jshint -W121 */

// bind is missing in phantomjs 1.9.7
// @href github.com/ariya/phantomjs/issues/10522
(function () {
  'use strict';
  if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
      if (typeof this !== 'function') {
        // closest thing possible to the ECMAScript 5
        // internal IsCallable function
        throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
      }

      var aArgs = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        NOP = function () {
        },
        fBound = function () {
          return fToBind.apply(this instanceof NOP && oThis ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
        };

      NOP.prototype = this.prototype;
      fBound.prototype = new NOP();

      return fBound;
    };
  }

  // From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
  if (!Object.keys) {
    Object.keys = (function () {
      var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
        dontEnums = [
          'toString',
          'toLocaleString',
          'valueOf',
          'hasOwnProperty',
          'isPrototypeOf',
          'propertyIsEnumerable',
          'constructor'
        ],
        dontEnumsLength = dontEnums.length;

      return function (obj) {
        if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
          throw new TypeError('Object.keys called on non-object');
        }

        var result = [], prop, i;

        for (prop in obj) {
          if (hasOwnProperty.call(obj, prop)) {
            result.push(prop);
          }
        }

        if (hasDontEnumBug) {
          for (i = 0; i < dontEnumsLength; i++) {
            if (hasOwnProperty.call(obj, dontEnums[i])) {
              result.push(dontEnums[i]);
            }
          }
        }
        return result;
      };
    }());
  }
}());
