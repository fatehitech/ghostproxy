process.env.NODE_ENV = 'test';
process.env.STORAGE_PATH = '/tmp'

var expect = require('chai').expect
  , mw = require('../../../src/server/middleware/authorize')
  , secret = require('../../../src/secret')

describe("middleware: authorize", function() {
  it("rejects incorrect token", function(done) {
    var req = {
      get: function(header) {
        return headers[header]
      }
    }
    var headers = {
      'X-Auth-Token': 'wrong!!'
    }
    var res = {
      status: function(code) {
        expect(code).to.eq(401)
        return { end: done }
      }
    }
    mw(req, res);
  });

  it("rejects missing token", function(done) {
    var req = {
      get: function(header) {
        return undefined
      }
    }
    var res = {
      status: function(code) {
        expect(code).to.eq(401)
        return { end: done }
      }
    }
    mw(req, res);
  });

  it("accepts correct token", function(done) {
    var req = {
      get: function(header) {
        return headers[header]
      }
    }
    var headers = {
      'X-Auth-Token': secret
    }
    mw(req, null, done);
  });
});
