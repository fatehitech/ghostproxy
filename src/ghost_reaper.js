module.exports = GhostReaper;
var logger = require('./logger');
var moment = require('moment');
var Ghosts = require('./ghosts');
var VPS = require('./vps');

function GhostReaper(ghost) {
  this.ghost = ghost;
}

GhostReaper.prototype.reap = function() {
  var vps = new VPS(this.ghost);
  return Ghosts.updateStatus(this.ghost, Ghosts.WAITING).then(function() {
    return vps.snapshotAndDestroy();
  }).then(function() {
    return Ghosts.updateStatus(this.ghost, Ghosts.OFF);
  });
}

GhostReaper.work = function() {
  return;
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
