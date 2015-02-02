var Promise = require('bluebird')
  , getFingerprint = require('ssh-fingerprint')
  , _ = require('lodash')

module.exports = function(client, ssh_public_key) {
  var fingerprint = getFingerprint(ssh_public_key)
  return function(keys) {
    return new Promise(function(resolve,reject){
      var ssh_key = _.find(keys, {fingerprint: fingerprint})
      if (! ssh_key) {
        client.addKey({
          name: 'saasbox-app-'+process.env.NODE_ENV,
          public_key: ssh_public_key
        }).then(resolve).catch(reject).error(reject)
      } else {
        resolve()
      }  
    })
  }
}
