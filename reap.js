module.exports = GhostReaper;
var logger = require('./src/logger');
var moment = require('moment');
var Ghosts = require('./src/ghosts');
var VPS = require('./src/vps');

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

Ghosts.find({}).map(function(ghost) {
  new GhostReaper(ghost).reap();
});
