var config = require('../etc/config');
var mongoURI = config.mongoURI;
var MongoClient = require('mongodb').MongoClient;
var Promise = require('bluebird');

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
  }
}

module.exports = Ghosts;
