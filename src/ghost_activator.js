module.exports = GhostActivator;
var logger = require('./logger');
var VPS = require('./vps');
var Ghosts = require('./ghosts');

function GhostActivator(ghost) {
  this.ghost = ghost
}

GhostActivator.prototype.requestActivation = function(done) {
  if (this.ghost.status >= Ghosts.WAITING) return done();
  var ghost = this.ghost;
  Ghosts.updateStatus(this.ghost, Ghosts.WAITING).then(function() {
    Ghosts.enqueueJob(ghost, 'vps', 'create');
    done();
  }, done);
}

GhostActivator.work = function() {
  logger.info('init GhostActivator');
  Ghosts.createWorker('vps', 'create', function (ghost, params, callback) {
    console.log('Vps create', ghost);
    var vps = new VPS(ghost);
    console.log(vps);
    return;
    try {
      vps.create().then(function() {
        logger.info("Created VPS");
        return vps.start().then(function() {
          logger.info("Started VPS");
          callback(null);
        });
      }, function(err) {
        logger.error(err.stack);
        callback(err);
      });
    } catch (e) {
      callback(e);
    }
  }).start();
}
