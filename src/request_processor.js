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
  Ghosts.createWorker('httpRequest', 'replay', function(ghost, params, callback) {
    var interval = setInterval(function() {
      if(ghost.status >= Ghosts.READY) {
        logger.info('replaying request');
        needle.post('http://'+ghost.ipAddress, params.data.body, { 
          headers: params.data.headers
        }, function(err, res) {
          if(err) logger.error('request processor error', err.stack);
          else logger.info('successful replay')
          clearInterval(interval);
          return callback(err)
        });
      }
    }, 5000);
  }).start();
}
