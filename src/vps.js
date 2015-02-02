var Promise = require('bluebird');
var promiseCreateVPS = require('./instance_provisioner/promise_create_vps');
module.exports = VPS;
function VPS(ghost) {
  this.ghost = ghost;
};

VPS.prototype.create = function() {
  if (this.ghost.snapshotId) {
    return this.createWithSnapshot(this.ghost.snapshotId);
  } else {
    return this.createWithProvisioner({
      type: this.ghost.provisioner,
      script: this.ghost.provisionerScript
    })
  }
}

VPS.prototype.createWithProvisioner = function(options) {
  this.ghost.memorySize = 512;
  this.ghost.region = 'sfo1';
  this.ghost.digitalOceanImage = 'ubuntu-14-04-x64';
  return promiseCreateVPS({
    onDelayed: {
      time: 10000,
      action: function(explanation) {
        console.log(explanation);
      }
    }
  })(this.ghost).then(function() {
    console.log('created it');
  });
}

VPS.prototype.createWithSnapshot = function(snapshotId) {
  return new Promise(function(resolve, reject) {
    
  });
}
