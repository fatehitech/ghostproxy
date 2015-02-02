var mongoURI = 'mongodb://127.0.0.1:3001/meteor';
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
  updateStatus: function(ghost, status) {
    return new Promise(function(resolve, reject) {
      getCollection(function(err, collection, db) {
        if (err) return reject(err);
        collection.update({_id: ghost._id}, {
          $set: {status: status}
        }, {w:1}, function(err) {
          if (err) return reject(err);
          resolve();
          db.close();
        });
      });
    });
  }
}

module.exports = Ghosts;
