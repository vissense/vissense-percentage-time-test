[![Build Status](https://api.travis-ci.org/vissense/vissense-percentage-time-test.png?branch=master)](https://travis-ci.org/vissense/vissense-percentage-time-test)
[![Coverage Status](https://coveralls.io/repos/vissense/vissense-percentage-time-test/badge.png?branch=master)](https://coveralls.io/r/vissense/vissense-percentage-time-test?branch=master)
[![Dependency Status](https://david-dm.org/vissense/vissense-percentage-time-test.svg)](https://david-dm.org/vissense/vissense-percentage-time-test)
[![devDependency Status](https://david-dm.org/vissense/vissense-percentage-time-test/dev-status.svg)](https://david-dm.org/vissense/vissense-percentage-time-test#info=devDependencies)

VisSense.js: Percentage Time Test
====

A [VisSense.js](https://github.com/vissense/vissense) plugin for testing percentages over time.

Examples
===

Invoke a callback if an element has been visible at least 50% for 1 second:
```javascript
var element = $('#myElement'); 
var visibility = VisSense(element[0]);

visibility.onPercentageTimeTestPassed(function() {
    console.log('element passed test for 50% visibility over 1 second.');
}, {
  percentageLimit: 0.5,
  timeLimit: 1000,
  interval: 100
});

// this is an alias for the above call as it is an IAB standard
visibility.on50_1TestPassed(function() {
    console.log('element passed test for 50% visibility over 1 second.');
});
```

Invoke a callback if an element has been visible at least 60% for 5 seconds:
```javascript
var video = $('#video'); 
var visibility = VisSense(video[0]);
visibility.onPercentageTimeTestPassed(function() {
    console.log('element passed test for 60% visibility over 5 seconds.');
}, {
  percentageLimit: 0.6,
  timeLimit: 5000,
  interval: 200
});
```
Contribute
------------

- Issue Tracker: https://github.com/vissense/vissense-percentage-time-test/issues
- Source Code: https://github.com/vissense/vissense-percentage-time-test

License
-------

The project is licensed under the MIT license. See
[LICENSE](https://github.com/vissense/vissense-percentage-time-test/blob/master/LICENSE) for details.
