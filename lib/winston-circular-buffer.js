var util = require('util');
var winston = require('winston');
var common = require('winston/lib/winston/common');
var os = require('os');
var cbuffer = require('circular-buffer');

var CircularBuffer = winston.transports.CircularBuffer = function (options) {
    winston.Transport.call(this, options);

    // Default name if not supplied in options
    this.name = options.name || 'circular-buffer';

    // Set the level
    this.level = options.level || 'info';

    // Set the buffer size
    this.size = options.size || 10;

    // The circular buffer
    this.buffer = cbuffer(this.size);

    // Common.log options
    this.json        = options.json !== false;
    this.colorize    = options.colorize    || false;
    this.prettyPrint = options.prettyPrint || false;
    this.timestamp   = typeof options.timestamp !== 'undefined' ? options.timestamp : true;
    this.showLevel   = options.showLevel === undefined ? true : options.showLevel;
    this.label       = options.label       || null;
    this.depth       = options.depth       || null;
    this.stringify   = options.stringify   || false;

};

// Inherit from `winston.Transport`
util.inherits(CircularBuffer, winston.Transport);

/**
 * Define a getter so that `winston.transports.CircularBuffer`
 * is available and thus backwards compatible.
 */
winston.transports.CircularBuffer = CircularBuffer;

//
// ### function log (level, msg, [meta], callback)
// #### @level {string} Level at which to log the message.
// #### @msg {string} Message to log
// #### @meta {Object} **Optional** Additional metadata to attach
// #### @callback {function} Continuation to respond to when complete.
// Core logging method exposed to Winston. Metadata is optional.
//
CircularBuffer.prototype.log = function (level, msg, meta, callback) {

    if (this.silent) {
      return callback(null, true);
    }

    if (typeof msg !== 'string') {
      msg = '' + msg;
    }

    var output = common.log({
        level:       level,
        message:     msg,
        meta:        meta,
        json:        this.json,
        colorize:    this.colorize,
        prettyPrint: this.prettyPrint,
        timestamp:   this.timestamp,
        showLevel:   this.showLevel,
        stringify:   this.stringify,
        label:       this.label,
        depth:       this.depth,
        humanReadableUnhandledException: this.humanReadableUnhandledException
    });

    try {
        if (this.json) {
            // common.log() adds lots of value, but it stringifies JSON.
            // We want to store real JSON objects in the buffer.
            this.buffer.enq(JSON.parse(output));
        }
        else {
            this.buffer.enq(output);
        }
        callback(null, true);
    }
    catch(err) {
        callback(err, false);
    }
};

//
// ### function query (options, callback)
// #### @options {Object}
// #### @callback {function} Continuation to respond to when complete.
// Query the transport. Options object is optional.
//
CircularBuffer.prototype.query = function (options, callback) {
    if (typeof options === 'function') {
        callback = options;
        options = {};
    }

    callback(null, this.buffer.toarray());
};
