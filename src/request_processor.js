module.exports = RequestProcessor;
var logger = require('./logger');
var config = require('../etc/config');
var monq = require('monq');
var needle = require('needle');
var client = monq(config.mongoURI);
var Ghosts = require('./ghosts');

function RequestProcessor() {
}

RequestProcessor.work = function() {
  logger.info('init RequestProcessor');
  var worker = client.worker(['payloads']);
  worker.register({
    replay: function(params, callback) {
      var interval = setInterval(function() {
        Ghosts.findOne({ fqdn: params.data.headers.host }).then(function(ghost) {
          if(ghost.status >= Ghosts.READY) {
            logger.info('replaying request');
            needle.post('http://'+ghost.ipAddress, params.data.body, { 
              headers: params.data.headers
            }, function(err, res) {
              if(err) { logger.error(err); callback(err) } else {
                logger.info('successful replay');
                clearInterval(interval);
                return callback();
              }
            });
          }
        });
      }, 5000);
    }
  });
  worker.start();
}






