module.exports = GhostReaper;
var logger = require('./logger');
var moment = require('moment');
var config = require('../etc/config');
var monq = require('monq');
var needle = require('needle');
var client = monq(config.mongoURI);
var Ghosts = require('./ghosts');
var VPS = require('./vps');

function GhostReaper(ghost) {
  this.ghost = ghost;
}

GhostReaper.prototype.reap = function() {
  var vps = new VPS(this.ghost);
  //vps.lock().
  //  then(vps.shutdown).
  //  then(vps.snapshot).
  //  then(vps.unlock)
}

GhostReaper.work = function() {
  logger.info('init GhostReaper');
  setInterval(function() {
    var age = moment().subtract(1, 'minute');
    Ghosts.find({
      status: Ghosts.READY,
      lastAccessed: { $lte: age._d }
    }).map(function(ghost) {
      new GhostReaper(ghost).reap();
    });
  }, 2000);
}
