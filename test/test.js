/**
 * Winston circular buffer unit tests.
 *
 * (c) Jonathan Perkins https://github.com/JonathanPerkins 2015
 */
var should = require('should');
var winston = require('winston');
var async = require('async');

var CircularBuffer = require('../index').CircularBuffer;

var options = {
  level: 'info',
  json: true,
  size: 5
};

/**
 * Helper functions
 */

 function validateStringRecord(record, id, level, msg) {
     record.should.be.a.String();
     record.should.containEql('"msg_id":'+id);
     record.should.containEql('"level":"'+level+'"');
     record.should.containEql('"message":"'+msg+'"');
     record.should.containEql('timestamp');
 }

function validateJsonRecord(record, id, level, msg) {
    record.should.be.an.Object();
    record.should.have.property('msg_id',  id);
    record.should.have.property('level',   level);
    record.should.have.property('message', msg);
    record.should.have.property('timestamp');
}

/**
 * Tests
 */

describe('Winston Circular Buffer', function () {

    var logger = null;
    var msgId = 0;

    // runs before all tests in this block
    before(function(done) {
        logger = new (winston.Logger)();
        logger.add(winston.transports.CircularBuffer, options);
        done();
    });

    describe('logging', function () {

        var testMessage = 'winston-circular-buffer test';

        it('should log a message and query both string and json', function (done) {

            logger.warn(testMessage, { msg_id: msgId++ }, function (err, level, msg, meta) {
                should.not.exist(err);
                level.should.equal('warn');
                msg.should.equal(testMessage);

                // Default query should return an array of strings
                logger.query(function(err, results) {
                    should.not.exist(err);
                    results['circular-buffer'].should.have.length(1);
                    validateStringRecord(results['circular-buffer'][0], 0, 'warn', testMessage);

                    // JSON query
                    logger.query({ json: true }, function(err, results) {
                        should.not.exist(err);
                        results['circular-buffer'].should.have.length(1);
                        validateJsonRecord(results['circular-buffer'][0], 0, 'warn', testMessage);
                        done();
                    });
                });
            });

        });

        it('should log a second message and query them in descending order', function (done) {

            logger.warn(testMessage, { msg_id: msgId++ }, function (err, level, msg, meta) {
                should.not.exist(err);
                level.should.equal('warn');
                msg.should.equal(testMessage);

                logger.query({ json: true }, function(err, results) {
                    should.not.exist(err);
                    results['circular-buffer'].should.have.length(2);
                    // Should be in descending order (most recent first)
                    validateJsonRecord(results['circular-buffer'][0], 1, 'warn', testMessage);
                    validateJsonRecord(results['circular-buffer'][1], 0, 'warn', testMessage);
                    done();
                });
            });
        });

        it('should log a more messages, wrap and return most recent', function (done) {

            // Buffer currently contains 2 messages out of 5 max. log 4 more to wrap.
            async.waterfall([

                function(next) {
                    logger.warn(testMessage, { msg_id: msgId++ }, function (err, level, msg, meta) {
                        should.not.exist(err);
                        level.should.equal('warn');
                        msg.should.equal(testMessage);
                        next(null);
                    });
                },
                function(next) {
                    logger.warn(testMessage, { msg_id: msgId++ }, function (err, level, msg, meta) {
                        should.not.exist(err);
                        level.should.equal('warn');
                        msg.should.equal(testMessage);
                        next(null);
                    });
                },
                function(next) {
                    logger.error(testMessage, { msg_id: msgId++ }, function (err, level, msg, meta) {
                        should.not.exist(err);
                        level.should.equal('error');
                        msg.should.equal(testMessage);
                        next(null);
                    });
                },
                function(next) {
                    logger.info(testMessage, { msg_id: msgId++ }, function (err, level, msg, meta) {
                        should.not.exist(err);
                        level.should.equal('info');
                        msg.should.equal(testMessage);
                        next(null);
                    });
                },

                // Test for buffer contents
                function(next) {
                    logger.query({ json: true }, function(err, results) {
                        should.not.exist(err);
                        results['circular-buffer'].should.have.length(5);
                        // Should be in descending order (most recent first)
                        validateJsonRecord(results['circular-buffer'][0], 5, 'info', testMessage);
                        validateJsonRecord(results['circular-buffer'][1], 4, 'error', testMessage);
                        validateJsonRecord(results['circular-buffer'][2], 3, 'warn', testMessage);
                        validateJsonRecord(results['circular-buffer'][3], 2, 'warn', testMessage);
                        validateJsonRecord(results['circular-buffer'][4], 1, 'warn', testMessage);
                        next(null);
                    });
                }

            ], function (err, result) {
                done(err);
            });
        });

        it('should optionally return results in ascending order', function (done) {
            logger.query({ json: true, order: 'asc' }, function(err, results) {
                should.not.exist(err);
                results['circular-buffer'].should.have.length(5);
                // Should be in descending order (most recent first)
                validateJsonRecord(results['circular-buffer'][0], 1, 'warn', testMessage);
                validateJsonRecord(results['circular-buffer'][1], 2, 'warn', testMessage);
                validateJsonRecord(results['circular-buffer'][2], 3, 'warn', testMessage);
                validateJsonRecord(results['circular-buffer'][3], 4, 'error', testMessage);
                validateJsonRecord(results['circular-buffer'][4], 5, 'info', testMessage);
                done();
            });
        });

    });

});
