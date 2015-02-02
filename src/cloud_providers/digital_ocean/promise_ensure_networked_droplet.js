var Promise = require('bluebird')
var _ = require('lodash')
var backoff = require('backoff')
var logger = require('../../logger')

module.exports = function(ghost, client, options) {
  return function(new_droplet_payload) {
    return new Promise(function(resolve, reject){
      var waitForNetwork = function(ghost) {
        var droplet = ghost.droplet;
        return new Promise(function(resolve, reject) {
          var fibonacciBackoff = backoff.fibonacci({
            randomisationFactor: 0,
            initialDelay: 1000,
            maxDelay: 120000
          });
          var check = function(number, delay) {
            logger.info('checking droplet network', droplet.id, 'backoff:', number + ' ' + delay + 'ms');
            client.fetchDroplet(droplet.id).then(function(droplet) {
              try {
                var ip = _.find(droplet.networks.v4, { type: 'public' }).ip_address
                if (ip) {
                  logger.info("found ip!", ip)
                  fibonacciBackoff.reset()
                  resolve(droplet);
                }
              } catch (e) {}
            })
          }
          var actedOnDelay = false;
          fibonacciBackoff.on('ready', function(number, delay) {
            if (options.onDelayed && ! actedOnDelay) {
              var time = options.onDelayed.time;
              if (delay > time) {
                var explanation = 'Still waiting for Digital Ocean.'
                options.onDelayed.action(explanation)
                actedOnDelay = true;
              }
            }
            check(number, delay)
            fibonacciBackoff.backoff();
          });
          fibonacciBackoff.backoff();
        })
      }

      var promise = null;
      var droplet = ghost.droplet;
      if (droplet) {
        logger.info("vps exists")
        promise = client.fetchDroplet(ghost.droplet.id)
      } else {
        logger.info("no vps exists, creating it")
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

