var should = require('should');
var winston = require('winston');

var CircularBuffer = require('../index').CircularBuffer;

var options = {
  level: 'info',
  size: 5
};

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

        it('should log a message and query it', function (done) {

            logger.warn(testMessage, { msg_id: msgId++ }, function (err, level, msg, meta) {
                should.not.exist(err);
                level.should.equal('warn');
                msg.should.equal(testMessage);

                logger.query(function(err, results) {
                    should.not.exist(err);
                    console.log(results);
                    done();
                });
            });

        });

        it('should log a second message and query them', function (done) {

            logger.warn(testMessage, { msg_id: msgId++ }, function (err, level, msg, meta) {
                should.not.exist(err);
                level.should.equal('warn');
                msg.should.equal(testMessage);

                logger.query(function(err, results) {
                    should.not.exist(err);
                    console.log(results);
                    done();
                });
            });
        });

    });

});
