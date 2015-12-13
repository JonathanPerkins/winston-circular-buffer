# Winston Circular buffer

An in-memory circular buffer logging transport for winston.js node.js logging system.

This transport allows a simple most-recent view of log entries from a bounded
circular buffer. Useful if you just want to see whats recently happened without
worrying about memory usage, file rotation etc.

## Usage

Specify the size of the buffer when adding the transport:

```javascript
var winston = require('winston');
var cbuff   = require('winston-circular-buffer');

var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.CircularBuffer)({
            name: 'circular-buffer',
            level: 'info',
            size: 50
        })
    ]
});
```

Log as usual, and query the buffer:

```javascript
logger.warn('my warning', { meta: 21 });

logger.query(options, function(err, results) {
    // Check err, handle results array

});
```

The query options are optional(!) - none are currently defined.

To be continued...
