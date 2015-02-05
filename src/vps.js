var logger = require('./logger');
var Promise = require('bluebird');
var GhostProvisioner = require('./ghost_provisioner');
var Ghosts = require('./ghosts');
var createHost = require('./create_host')
var snapshotAndDestroyHost = require('./snapshot_and_destroy_host');
var blockUntilListening = require('./block_until_listening');
module.exports = VPS;
function VPS(ghost) {
  this.ghost = ghost;
}

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
  return createHost()(this.ghost);
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

VPS.prototype.snapshotAndDestroy = function() {
  var ghost = this.ghost;
  return snapshotAndDestroyHost()(ghost).then(function(snapshot) {
    logger.warn(snapshot);
    return Ghosts.set(ghost, { 
      snapshotId: snapshot._id
    });
  })
}
