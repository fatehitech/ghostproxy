var Promise = require('bluebird')
var net = require('net');
var logger = require('../logger')
var backoff = require('backoff')

module.exports = function(options) {
  var pattern = new RegExp(options.match)
  return new Promise(function(resolve, reject) {
    var blocking = true;
    var timeout = 2000;
    var fibonacciBackoff = backoff.fibonacci({
      randomisationFactor: 0,
      initialDelay: timeout+1000,
      maxDelay: 10000
    });

    var check = function(number, delay) {
      logger.info('checking tcp socket ip='+options.ip+' port='+options.port+' match='+options.match+' backoff '+number + ' ' + delay + 'ms');
      if (options.bumpProgress) {
        options.bumpProgress()
      }
      var client = new net.Socket();
      client.setTimeout(timeout, function() {
        client.destroy();
      })

      client.connect(options.port, options.ip)

      if (options.http) {
        client.write('GET /\n\n');
      }

      client.on('data', function(data) {
        console.log(data.toString());
        if (pattern.test(data.toString())) {
          blocking = false;
          client.destroy(); // kill client after server's response
          fibonacciBackoff.reset()
          resolve(options.ip)
        }
      });

      client.on('close', function() {
        //logger.warn('tcp socket closed')
      });

      client.on('error', function(err) {
        //logger.warn('tcp socket error', err.message)
      })
    }

    fibonacciBackoff.on('backoff', function(number, delay) {
      // Do something when backoff starts, e.g. show to the
      // user the delay before next reconnection attempt.
    });

    fibonacciBackoff.on('ready', function(number, delay) {
      // Do something when backoff ends, e.g. retry a failed
      // operation (DNS lookup, API call, etc.). If it fails
      // again then backoff, otherwise reset the backoff
      // instance.
      check(number, delay)
      fibonacciBackoff.backoff();
    });

    fibonacciBackoff.backoff();
  })
}
