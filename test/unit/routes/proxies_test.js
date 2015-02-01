process.env.NODE_ENV = 'test';
var expect = require('chai').expect
  , request = require('supertest')
  , app = require('../../../src/server/app').api.app
  , target = require('../../../src/target')
  , secret = require('../../../src/secret')

describe("POST /api/v1/proxies/:fqdn", function () {
  before(function() {
    target.clearAll();
  });

  after(function() {
    target.clearAll();
  });

  it("rejects unauthorized", function(done) {
    request(app).post('/api/v1/proxies/bottom.middle.top').expect(401).end(done)
  });

  it("creates the proxy target and returns 201 created", function(done) {
    request(app)
    .post('/api/v1/proxies/bottom.middle.top')
    .set('X-Auth-Token', secret)
    .send({ target: 'http://localhost:12345' })
    .expect(201)
    .end(function(err, res) {
      if (err) throw err;
      target.get('bottom.middle.top', function(err, reply) {
        expect(err).to.eq(null)
        expect(reply).to.eq('http://localhost:12345')
        done()
      })
    })
  });

  it("will set a target that's already been set", function(done) {
    request(app)
    .post('/api/v1/proxies/bottom.middle.top')
    .set('X-Auth-Token', secret)
    .send({ target: 'http://other.host:12345' })
    .expect(201)
    .end(function(err, res) {
      if (err) throw err;
      target.get('bottom.middle.top', function(err, reply) {
        expect(err).to.eq(null)
        expect(reply).to.eq('http://other.host:12345')
        request(app)
        .post('/api/v1/proxies/bottom.middle.top')
        .set('X-Auth-Token', secret)
        .send({ target: 'http://another.host:12345' })
        .expect(201)
        .end(function(err, res) {
          if (err) throw err;
          target.get('bottom.middle.top', function(err, reply) {
            expect(err).to.eq(null)
            expect(reply).to.eq('http://another.host:12345')
            done()
          })
        })
      })
    })

  });
})
