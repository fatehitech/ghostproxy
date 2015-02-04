var Promise = require('bluebird');
var logger = require('./logger');
var backoff = require('backoff');
module.exports = {
  defaults: {
    randomisationFactor: 0,
    initialDelay: 1000,
    maxDelay: 120000
  },
  check: function(checkFn) {
    var defaults = this.defaults;
    return new Promise(function(resolve, reject) {
      var fibonacciBackoff = backoff.fibonacci(defaults);
      fibonacciBackoff.on('ready', function(number, delay) {
        checkFn(number, delay, function resolver() {
          fibonacciBackoff.reset()
          resolve.apply(this, Array.prototype.slice.call(arguments))
        });
        fibonacciBackoff.backoff();
      });
      fibonacciBackoff.backoff();
    })
  }
}
