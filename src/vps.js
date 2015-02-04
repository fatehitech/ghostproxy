var logger = require('./logger');
var Promise = require('bluebird');
var GhostProvisioner = require('./ghost_provisioner');
var GhostReaper = require('./ghost_reaper');
var Ghosts = require('./ghosts');
var promiseCreateVPS = require('./promise_create_vps');
var blockUntilListening = require('./block_until_listening');
module.exports = VPS;
function VPS(ghost) {
  this.ghost = ghost;
};

VPS.prototype.create = function() {
  var create = null;
  if (this.ghost.snapshotId) {
    return this.createFromSnapshot(this.ghost.snapshotId);
  } else {
    return this.createFromScratch();
  }
}

VPS.prototype.createDroplet = function() {
  this.ghost.memorySize = 512;
  this.ghost.region = 'sfo1';
  this.ghost.digitalOceanImage = 'ubuntu-14-04-x64';
  return promiseCreateVPS()(this.ghost);
}

VPS.prototype.createFromScratch = function(options) {
  return this.createDroplet()
}

VPS.prototype.createFromSnapshot = function(snapshotId) {
  return this.createDroplet()
}

VPS.prototype.start = function() {
  logger.info("vps::start");
  return Ghosts.reload(this.ghost).then(function(ghost) {
    if (ghost.isProvisioned) {
      logger.info("Ghost is already provisioned, won't provision");
    } else if (ghost.snapshotId) {
      logger.info("Ghost is from a snapshot, won't provision");
    } else {
      logger.info("Will provision ghost");
      var provisioner = new GhostProvisioner(ghost, {
        type: ghost.provisioner,
        script: ghost.provisionerScript
      });
      return provisioner.provision();
    }
    return ghost;
  }).then(function(ghost) {
    return blockUntilListening({
      http: true,
      port: ghost.httpPort,
      ip: ghost.ipAddress
    }).then(function() {
      logger.info("http service is now responsive");
      return ghost;
    })
  }).then(function(ghost) {
    return Ghosts.set(ghost, { status: Ghosts.READY });
  });
}

VPS.prototype.lock = function() {
  return Ghosts.set(this.ghost, { locked: true });
}

VPS.prototype.shutdown = function() {
  var ghost = this.ghost;
  return new Promise(function(resolve, reject) {
    return Ghosts.set(ghost, { status: '' });
  });
}

VPS.prototype.snapshot = function() {
  var ghost = this.ghost;
  DO.snapshot.then(function() {
    return Ghosts.set(ghost, { 
      snapshotId: snapshot._id
    });
  })
}
