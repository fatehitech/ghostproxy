module.exports = GhostActivator;
var logger = require('./logger');
var config = require('../etc/config');
var monq = require('monq');
var client = monq(config.mongoURI);
var VPS = require('./vps');
var Ghosts = require('./ghosts');

function GhostActivator(ghost) {
  this.ghost = ghost
}

GhostActivator.prototype.requestActivation = function(done) {
  if (this.ghost.status >= Ghosts.WAITING) return done();
  var ghost = this.ghost;
  Ghosts.updateStatus(this.ghost, Ghosts.WAITING).then(function() {
    var queue = client.queue('vps');
    queue.enqueue('create', { ghost: ghost }, function (err, job) {
      if (err) return logger.error(err.stack);
      logger.info('enqueued vps::create');
    });
    done();
  }, done);
}

GhostActivator.work = function() {
  logger.info('init GhostActivator')
  var worker = client.worker(['vps']);
  worker.register({
    create: function (params, callback) {
      var vps = new VPS(params.ghost);
      try {
        logger.info('vps::creator start');
        vps.create().then(function() {
          logger.info("Created VPS");
          return vps.start().then(function() {
            logger.info("Started VPS");
            callback(null);
          });
        }, function(err) {
          logger.error(err.stack);
          callback(err);
        });
      } catch (e) {
        callback(e);
      }
    }
  });

  worker.on('dequeued', function (data) { });
  worker.on('failed', function (data) {
    logger.error(data.stack);
  });
  worker.on('complete', function (data) {
    logger.info('job complete');
  });
  worker.on('error', function (err) {
    logger.error(err.stack);
  });
  worker.start();
}
