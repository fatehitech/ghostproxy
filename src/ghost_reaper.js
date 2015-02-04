module.exports = GhostReaper;
var logger = require('./logger');
var moment = require('moment');
var config = require('../etc/config');
var monq = require('monq');
var needle = require('needle');
var client = monq(config.mongoURI);
var Ghosts = require('./ghosts');

function GhostReaper() {}

GhostReaper.reap = function(ghost) {
  logger.info('in GhostReaper.reap() ', ghost.fqdn);
}

GhostReaper.work = function() {
  logger.info('init GhostReaper');
  Ghosts.createWorker('reaper', 'reap', function(ghost, params, callback) {
    logger.info('running reaper');
    var lastAccessed = moment(ghost.lastAccessed);
    var minutesUp = moment().diff(lastAccessed, 'minutes');
    logger.info('ghost was up for '+minutesUp+' minutes');
    if (minutesUp > 1) {
      GhostReaper.reap(ghost);
    } else {
      Ghosts.enqueueJob(ghost, 'reaper', 'reap');
    }
  }).start();
}
