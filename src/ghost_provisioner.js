module.exports = GhostProvisioner;
var logger = require('./logger');
var blockUntilListening = require('./instance_provisioner/block_until_listening');
function GhostProvisioner(opts) {
  this.type = opts.type;
  this.script = opts.script;
}

GhostProvisioner.prototype.provision = function(ghost) {
  logger.info("provisioning ghost", ghost);

  return blockUntilListening({
    port: 22,
    ip: ghost.ipAddress,
    match: "SSH"
  }).then(function(ip) {
    logger.info('SSH connection now possible');
  });
}
