var Promise = require('bluebird')
var _ = require('lodash')
var backoff = require('../../backoff')
var logger = require('../../logger')

module.exports = function(ghost, client) {
  return function(new_droplet_payload) {
    return new Promise(function(resolve, reject){
      var waitForNetwork = function(ghost) {
        var droplet = ghost.droplet;
        return backoff.check(function(number, delay, resolve) {
          if (number > 0)
            logger.info('waiting for DigitalOcean to publish droplet ip address');
          client.fetchDroplet(droplet.id).then(function(droplet) {
            var ip = _.find(droplet.networks.v4, { type: 'public' }).ip_address;
            if (ip) resolve(droplet);
          })
        });
      }

      var promise = null;
      if (ghost.droplet) {
        promise = client.fetchDroplet(ghost.droplet.id)
      } else {
        promise = client.createDroplet(new_droplet_payload)
      }
      promise
      .then(promiseUpdateGhostDroplet(ghost))
      .then(waitForNetwork)
      .then(promiseUpdateGhostDroplet(ghost))
      .then(resolve)
      .catch(reject)
      .error(reject)
    })
  }
}

var Ghosts = require('../../ghosts');

function promiseUpdateGhostDroplet(ghost) {
  return function (droplet) {
    return Ghosts.updateDroplet(ghost, droplet);
  }
}
