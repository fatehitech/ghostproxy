var nautical = require('nautical')
  , Promise = require('bluebird')
  , client = null;

module.exports = function(config) {
  client = nautical.getClient(config)
  return {
    imageList: promiseImageList,
    sizes: promiseSizes,
    keys: promiseKeys,
    addKey: promiseAddKey,
    createDroplet: promiseCreateDroplet,
    removeDroplet: promiseRemoveDroplet,
    fetchDroplet: promiseFetchDroplet,
    dropletActions: client.dropletActions
  }
}

function promiseAddKey(data) {
  return new Promise(function(resolve, reject) {
    var callback = function(err, reply) {
      if (err) return reject(err);
      if (reply.res.statusCode !== 201)
        return reject(new Error(JSON.stringify(reply.body)));
      resolve(reply)
    };
    client.keys.create(data, callback);
  })
}

function promiseCreateDroplet(data) {
  return new Promise(function(resolve, reject) {
    var callback = function(err, reply) {
      if (err) return reject(err);
      if (reply.res.statusCode !== 202)
        return reject(new Error(JSON.stringify(reply.body)));
      resolve(reply.body.droplet)
    };
    client.droplets.create(data, callback);
  })
}

function promiseRemoveDroplet(id) {
  return new Promise(function(resolve, reject) {
    var callback = function(err, reply) {
      if (err) return reject(err);
      if (reply.res.statusCode !== 204)
        return reject(new Error(JSON.stringify(reply.body)));
      resolve(null)
    };
    client.droplets.remove(id, callback);
  })
}

function promiseFetchDroplet(id) {
  return new Promise(function(resolve, reject) {
    var callback = function(err, reply) {
      if (err) return reject(err);
      if (reply.res.statusCode !== 200)
        return reject(new Error(JSON.stringify(reply.body)));
      resolve(reply.body.droplet)
    };
    client.droplets.fetch(id, callback);
  })
}


function promiseImageList() {
  return new Promise(function(resolve, reject) {
    var imageList = [];

    var callback = function(err, reply) {
      if (err) return reject(err);
      imageList = imageList.concat(reply.body.images);

      // get the next page
      if ('function' === typeof reply.next)
        reply.next(callback);
      else
        resolve(imageList)
    };

    client.images.list(callback);
  })
}

function promiseSizes() {
  return new Promise(function(resolve, reject) {
    var sizes = [];

    var callback = function(err, reply) {
      if (err) return reject(err);
      sizes = sizes.concat(reply.body.sizes);

      // get the next page
      if ('function' === typeof reply.next)
        reply.next(callback);
      else
        resolve(sizes)
    };

    client.sizes.list(callback);
  })
}

function promiseKeys() {
  return new Promise(function(resolve, reject) {
    var keys = [];

    var callback = function(err, reply) {
      if (err) return reject(err);
      keys = keys.concat(reply.body.ssh_keys);

      // get the next page
      if ('function' === typeof reply.next)
        reply.next(callback);
      else
        resolve(keys)
    };

    client.keys.list(callback);
  })
}
