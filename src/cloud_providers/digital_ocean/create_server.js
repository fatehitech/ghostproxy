var logger = require('../../logger')
  , _ = require('lodash')
  , getFingerprint = require('ssh-fingerprint')
  , ensureKey = require('./promise_ensure_key')
  , ensureNetworkedDroplet = require('./promise_ensure_networked_droplet')

var Ghosts = require('../../ghosts');

module.exports = function(client) {
  return function(ghost, ssh_public_key, options, done) {
    var fingerprint = getFingerprint(ssh_public_key)
    client.keys()
    .then(ensureKey(client, ssh_public_key))
    .then(client.sizes)
    .then(function(sizes) {
      var size = _.find(sizes, { memory: ghost.memorySize })
      var region = _.find(size.regions, function(rslug) {
        if (ghost.region === rslug) return true;
      });
      return {
        region: region,
        size: size.slug
      }
    }).then(function(data) {
      return {
        image: ghost.digitalOceanImage,
        name: ghost.fqdn,
        region: data.region,
        size: data.size,
        ssh_keys: [fingerprint],
        backups: false
      }
    })
    .then(ensureNetworkedDroplet(ghost, client, options))
    .then(function(ghost) {
      var droplet = ghost.droplet;
      var addr = _.find(droplet.networks.v4, { type: 'public' }).ip_address
      return Ghosts.updateIpAddress(ghost, addr);
    }).then(function(ghost) {
      done(null, ghost);
    }).catch(done).error(done)
  }
}

/*
Preferred Image:

{ id: 5141286,
    name: 'Ubuntu 14.04 x64',
    distribution: 'Ubuntu',
    slug: 'ubuntu-14-04-x64',
    public: true,
    regions:
     [ 'nyc1',
       'ams1',
       'sfo1',
       'nyc2',
       'ams2',
       'sgp1',
       'lon1',
       'nyc3',
       'ams3' ],
    created_at: '2014-07-23T17:08:52Z' },

To get the full list again, use:

  client.imageList().then(function(imageList) {
    console.log(imageList)
  })
*/
