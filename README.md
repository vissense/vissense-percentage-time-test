# vissense-timer.js

* destination file contains again.js

### What it does
 * provides a convenience class for periodically tasks based on elements visibility
 * updates a vismon object every X milliseconds and triggers registered handlers

### What it does *not*
 * being a hundred percent accurate timer. since it updates a vismon object every X milliseconds
   it can callback your handler X milliseconds "too late". if you want an other strategy you must
   provide it yourself (like updating the vismon instance based on user events).