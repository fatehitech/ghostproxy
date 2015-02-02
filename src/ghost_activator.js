module.exports = GhostActivator;

var Ghosts = require('./ghosts');

function GhostActivator(ghost) {
  this.ghost = ghost
}

GhostActivator.prototype.requestActivation = function(done) {
  Ghosts.updateStatus(this.ghost, Ghosts.WAITING);
  done();
}
