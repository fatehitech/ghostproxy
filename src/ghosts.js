var mongoURI = 'mongodb://127.0.0.1:3001/meteor';
var MongoClient = require('mongodb').MongoClient;
var Promise = require('bluebird');

var Ghosts = {
  find: function(query) {
    return new Promise(function(resolve, reject) {
      MongoClient.connect(mongoURI, function(err, db) {
        if(err) return reject(err);
        var collection = db.collection('ghosts');
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
  lookupProxyPath: function(fqdn) {
    return new Promise(function(resolve, reject) {
      Ghosts.findOne({ fqdn: fqdn }).then(function(ghost) {
        if (ghost && ghost.proxyPath) return resolve(ghost.proxyPath);
        else return reject(new Error('No ghost defined with that fqdn'));
      });
    });
  }
}

module.exports = Ghosts;
