/**
 * Winston circular buffer
 *
 * (c) Jonathan Perkins https://github.com/JonathanPerkins 2015
 */

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

/**
 * Standard winston transport log function.
 *  @level {string} Level at which to log the message.
 *  @msg {string} Message to log
 *  @meta {Object} **Optional** Additional metadata to attach
 *  @callback {function} Continuation to respond to when complete.
 */
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

    this.buffer.enq(output);
    callback(null, true);
};

/**
 * Standard winston transport query function.
 *  @options  {Object}   **Optional** Options
 *  @callback {function} Continuation to respond to when complete.
 */
CircularBuffer.prototype.query = function (options, callback) {
    if (typeof options === 'function') {
        callback = options;
        options = {};
    }

    var records = [];
    if (options.order && options.order === 'asc') {
        for (i=this.buffer.size()-1; i>=0; i--) {
            records.push(this.buffer.get(i));
        }
    }
    else {
        records = this.buffer.toarray();
    }

    // If formatting is set to json then optionally the query reponse can
    // be converted to json objects.
    if (this.json && options.json && options.json === true) {
        var json = [];
        for (i=0; i<records.length; i++) {
            // Just return successfully parsed entries
            try {
                json.push(JSON.parse(records[i]));
            }
            catch(e) {
                console.error('Failure parsing log record: '+records[i]);
            }
        }

        callback(null, json);
    }
    else {
        callback(null, records);
    }
};
