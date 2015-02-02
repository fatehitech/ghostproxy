var RESPONSES = require('./responses');
var Ghosts = require('./ghosts');

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
    return this.activateGhost(function(err) {
      if (err) return RESPONSES.gatewayError(res);
      return this.queueRequestForReplay(req, function(err) {
        if (err) return RESPONSES.gatewayError(res);
        else return RESPONSES.ok(res);
      });
    });
  }
}

GhostRequestHandler.prototype.activateGhost = function(done) {
  if (this.ghost.status >= Ghosts.WAITING) return done();
  else {
    //this.ghost.update({ status: 'waiting' });
    // send DO request
    console.log('start DO');
    done();
  }
}

GhostRequestHandler.prototype.queueRequestForReplay = function(req) {
  console.log('queue for replay nonget');
}
