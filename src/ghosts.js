var monq = require('monq');
var config = require('../etc/config');
var mongoURI = config.mongoURI;
var MongoClient = require('mongodb').MongoClient;
var monqClient = monq(config.mongoURI);
var Promise = require('bluebird');
var logger = require('./logger');

var getCollection = function(cb) {
  MongoClient.connect(mongoURI, function(err, db) {
    if(err) return cb(err);
    cb(null, db.collection('ghosts'), db);
  });
}

var Ghosts = {
  OFF: 0,
  WAITING: 1,
  READY: 2,
  find: function(query) {
    return new Promise(function(resolve, reject) {
      getCollection(function(err, collection, db) {
        if (err) return reject(err);
        collection.find(query).toArray(function(err, results) {
          if(err) return reject(err);
          resolve(results);
          db.close();
        });
      })
    });
  },
  findOne: function(query) {
    return Ghosts.find(query).then(function(results) {
      return results[0];
    })
  },
  reload: function(ghost) {
    return this.findOne({ _id: ghost._id });
  },
  // set attributes and return the new document
  set: function(ghost, data) {
    var self = this;
    return new Promise(function(resolve, reject) {
      if (!ghost) return reject(new Error("Ghost is undefined"));
      getCollection(function(err, collection, db) {
        if (err) return reject(err);
        var query = {_id: ghost._id};
        collection.update(query, { $set: data }, {w:1}, function(err) {
          if (err) return reject(err);
          collection.find(query).toArray(function(err, results) {
            if(err) return reject(err);
            resolve(results[0]);
            db.close();
          });
        });
      });
    });
  },
  updateStatus: function(ghost, status) {
    return this.set(ghost, { status: status });
  },
  updateDroplet: function(ghost, droplet) {
    return this.set(ghost, { droplet: droplet });
  },
  updateIpAddress: function(ghost, addr) {
    return this.set(ghost, { ipAddress: addr });
  },
  enqueueJob: function(ghost, queueName, actionName, data) {
    var queue = monqClient.queue(queueName);
    var params = { ghostId: ghost._id, data: data }
    queue.enqueue(actionName, params, function (err, job) {
      if (err) return logger.error('enqueue failure: '+err.stack);
      logger.info('enqueued '+queueName+'::'+actionName);
    });
  },
  createWorker: function(queueName, actionName, actionFunction) {
    var worker = monqClient.worker([queueName]);
    var actions = {};
    actions[actionName] = function(params, callback) {
      Ghosts.findOne({ _id: params.ghostId }).then(function(ghost) {
        actionFunction.apply(this, [ghost, params, callback]);
      }, function() {
        logger.error('no ghost by that id');
        callback(new Error("No ghost by that id"));
      });
    }
    worker.register(actions);
    var label = queueName+'::'+actionName;
    worker.on('dequeued', function (data) {
      logger.info(label+' dequeued a job');
    });
    worker.on('failed', function (data) {
      logger.error(label+' '+data.stack);
    });
    worker.on('complete', function (data) {
      logger.info(label+' job complete');
    });
    worker.on('error', function (err) {
      logger.error(label+' '+err.stack);
    });
    return worker;
  }
}

module.exports = Ghosts;
