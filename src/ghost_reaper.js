module.exports = GhostReaper;
var logger = require('./logger');
var moment = require('moment');
var config = require('../etc/config');
var monq = require('monq');
var needle = require('needle');
var client = monq(config.mongoURI);
var Ghosts = require('./ghosts');

function GhostReaper() {
}

GhostReaper.enqueue = function(data) {
  var queue = client.queue('reaper');
  queue.enqueue('reap', data, function (err, job) {
    if (err) {
      logger.error('reaper queue error', err);
    } else {
      logger.info('enqueued reaper::reap');
    }
  });
}

GhostReaper.reap = function(ghost) {
  logger.info('in GhsotReaper.reap() ', ghost.fqdn);
}

GhostReaper.work = function() {
  logger.info('init GhostReaper');
  var worker = client.worker(['reaper']);
  worker.register({
    reap: function(params, callback) {
      logger.info('running reaper');
      Ghosts.findOne({ _id: params.ghostId }).then(function(ghost) {
        logger.info('found ghost, checking last accessed');
        var lastAccessed = moment(ghost.lastAccessed);
        var minutesUp = moment().diff(lastAccessed, 'minutes');
        logger.info('ghost was up for '+minutesUp+' minutes');
        if (minutesUp > 1) {
          GhostReaper.reap(ghost);
        } else {
          GhostReaper.enqueue(params);
        }
      }, function(err) {
        logger.error('ghost find error', err);
      });
    }
  });
  worker.start();
}
