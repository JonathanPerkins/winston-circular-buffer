# Winston Circular buffer
[![Build Status](https://travis-ci.org/JonathanPerkins/winston-circular-buffer.svg)](https://travis-ci.org/JonathanPerkins/winston-circular-buffer)

An in-memory circular buffer logging transport for the [winston.js](https://github.com/winstonjs/winston) node.js logging system.

This transport allows a simple most-recent view of log entries from a bounded
circular buffer. Useful if you just want to see whats recently happened without
having to manage growing memory usage, file rotation etc.

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
            json: true,
            size: 50
        })
    ]
});
```

Log as usual, and query the buffer:

```javascript
logger.warn('my warning', { meta: 21 });

var options = {
    json: true,
    order: 'asc'
};

logger.query(options, function(err, results) {
    // Check err, handle results array

});
```

The query options are:
* `json:` set to `true` (default) if you want the records to be json objects, `false` for strings (note that if the transport has been configured for `json: false` then you will always get strings returned).
* `order:` set to `'desc'` (default) to produce descending order results (most recent first). Use `order: 'asc'` for ascending output.


## Install

```bash
npm install
```

## Test

```bash
npm test
```

## Author

(c) Jonathan Perkins 2015.

Feedback, bug reports welcome via https://github.com/JonathanPerkins/winston-circular-buffer
