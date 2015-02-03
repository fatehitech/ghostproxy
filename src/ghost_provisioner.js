module.exports = GhostProvisioner;
var Client = require('ssh2').Client;
var Ghosts = require('./ghosts');
var GhostReaper = require('./ghost_reaper');
var Promise = require('bluebird');
var logger = require('./logger');
var config = require('../etc/config');
var privKeyPath = config.ssh.privateKeyPath;
var blockUntilListening = require('./instance_provisioner/block_until_listening');

function GhostProvisioner(ghost, opts) {
  this.ghost = ghost;
  this.type = opts.type;
  this.script = opts.script;
}

GhostProvisioner.prototype.provision = function() {
  var done = this.setIsProvisioned.bind(this);
  if (this.type === 'bash') {
    return this.provisionWithBash().then(done);
  } else {
    logger.warn("Unsupported provisioner", this.type);
  }
}

GhostProvisioner.prototype.setIsProvisioned = function() {
  logger.info('setting Ghost.isProvisioned to true');
  return Ghosts.set(this.ghost, { isProvisioned: true });
}

GhostProvisioner.prototype.provisionWithBash = function() {
  var self = this;
  logger.info('will provision with bash');
  return blockUntilListening({
    port: 22,
    ip: this.ghost.ipAddress,
    match: "SSH"
  }).then(function(ip) {
    logger.info('SSH connection now possible');
    return self.runRemoteScript(self.script, {
      host: self.ghost.ipAddress,
      port: 22,
      username: 'root',
      hostVerifier: function() { return true },
      privateKey: require('fs').readFileSync(privKeyPath)
    });
  })
}

GhostProvisioner.prototype.runRemoteScript = function(script, connectOpts) {
  return new Promise(function(resolve, reject) {
    var conn = new Client();
    conn.on('ready', function() {
      conn.exec(script, function(err, stream) {
        if (err) {
          logger.warn('ssh was not ready -- retrying');
          runRemoteScript(script, connectOpts);
        }
        stream.on('close', function(exitCode, signal) {
          conn.end();
          if (exitCode === 0) return resolve();
          else reject(new Error("Remote script exited with non-zero status"));
        }).on('data', function(data) {
          logger.info(data.toString().trim());
        }).stderr.on('data', function(data) {
          logger.warn(data.toString().trim());
        });
      });
    }).connect(connectOpts);
  });
}
