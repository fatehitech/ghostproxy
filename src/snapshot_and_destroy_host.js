var Promise = require('bluebird')
  , config = require('../etc/config')
  , cloudProviders = require('./cloud_providers')
  , fs = require('fs')
  , path = require('path')
  , pubKeyPath = config.ssh.publicKeyPath

module.exports = function(options) {
  return function(ghost) {
    return new Promise(function(resolve, reject) {
      var api = cloudProviders.DigitalOcean({
        token: ghost.digitalOceanApiKey
      });
      api.snapshotServer(ghost.droplet.id, function(err, snapshot) {
        if (err) return reject(err);
        api.destroyServer(ghost.droplet.id, function(err) {
          if (err) return reject(err);
          resolve(snapshot);
        })
      })
    })
  }
}
