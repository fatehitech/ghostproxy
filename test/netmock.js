var nock = require('nock');

module.exports = {
  DigitalOcean: {
    Create: function() {
      return {
        getKeys: function() {
          return nock('https://api.digitalocean.com')
          .get('/v2/account/keys')
          .reply(200, {});
        }(),
        addKey: function() {
          return nock('https://api.digitalocean.com')
          .post('/v2/account/keys')
          .reply(201, {});
        }(),
        getSizes: function() {
          return nock('https://api.digitalocean.com')
          .get('/v2/sizes')
          .reply(200, {
            sizes: [{
              memory: 512,
              regions: ['sfo1']
            }]
          });
        }(),
        createDroplet: function() {
          return nock('https://api.digitalocean.com')
          .post('/v2/droplets')
          .reply(202, {
            droplet: { id: 2 }
          });
        }(),
        getDroplet: function() {
          return nock('https://api.digitalocean.com')
          .get('/v2/droplets/2')
          .reply(200, {
            droplet: { networks: { v4: [ { ip_address: '1.2.3.4', type: 'public' } ] } }
          });
        }()
      }
    }
  }
}
