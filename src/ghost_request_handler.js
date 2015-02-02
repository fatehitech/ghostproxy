var streamToBuffer = require('stream-to-buffer');
var config = require('../etc/config');
var logger = require('./logger');
var monq = require('monq');
var client = monq(config.mongoURI);
var RESPONSES = require('./responses');
var Ghosts = require('./ghosts');
var GhostActivator = require('./ghost_activator');

module.exports = GhostRequestHandler;
function GhostRequestHandler(ghost) {
  this.ghost = ghost;
}

/* req and res are standard; proxy can be simply 
 * called without arguments to process as proxy to downstream */
GhostRequestHandler.prototype.handleRequest = function(req, res, proxy) {
  if (req.method === 'GET') {
    return this.handleGetRequest(req, res, proxy);
  } else {
    return this.handleNonGetRequest(req, res, proxy);
  }
}

GhostRequestHandler.prototype.handleGetRequest = function(req, res, proxy) {
  if (this.ghost.status >= Ghosts.READY) {
    return proxy();
  } else {
    return this.activateGhost(function(err) {
      if (err) return RESPONSES.gatewayError(res);
      return RESPONSES.browserLoader(res);
    });
  }
}

GhostRequestHandler.prototype.handleNonGetRequest = function(req, res, proxy) {
  if (this.ghost.status >= Ghosts.READY) {
    return proxy();
  } else {
    var self = this;
    return this.activateGhost(function(err) {
      if (err) return RESPONSES.gatewayError(res);
      return self.queueRequestForReplay(req, function(err) {
        if (err) return RESPONSES.gatewayError(res);
        else return RESPONSES.ok(res);
      });
    });
  }
}

GhostRequestHandler.prototype.activateGhost = function(done) {
  if (this.ghost.status >= Ghosts.WAITING) return done();
  else {
    var activator = new GhostActivator(this.ghost);
    activator.requestActivation(function(err) {
      return done(err);
    });
  }
}

GhostRequestHandler.prototype.queueRequestForReplay = function(req, cb) {
  var queue = client.queue('payloads');
  streamToBuffer(req, function (err, buffer) {
    if (err) throw err;
    var payload = {
      header: req.headers,
      body: buffer.toString()
    };
    queue.enqueue('replay', { data: payload }, function (err, job) {
      if (err) {
        logger.error(err);
        return cb(err);
      } else {
        logger.info('enqueued payload::create');
        return cb();
      }
    });
  });
}
