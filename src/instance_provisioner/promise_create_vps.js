var Promise = require('bluebird')
  , config = require('../../etc/config')
  , cloudProviders = require('../cloud_providers')
  , fs = require('fs')
  , path = require('path')
  , pubKeyPath = config.ssh.publicKeyPath

module.exports = function(options) {
  return function(ghost) {
    return new Promise(function(resolve, reject) {
      var api = cloudProviders.DigitalOcean({
        token: ghost.digitalOceanApiKey
      });

      if (ghost.ipAddress) {
        return resolve(ghost.ipAddress)
      } else {
        fs.readFile(pubKeyPath, function(err, pubKey) {
          if (err) return reject(err);
          api.createServer(ghost, pubKey.toString(), options, function(err, ipAddress) {
            if (err) return reject(err);
            resolve(ipAddress);
          })
        })
      }
    })
  }
}
