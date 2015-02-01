var logger = console
  , storage = require('./storage').localStorage
  , cache = {}

module.exports = {
  /* Get proxy target */
  get: function (fqdn, cb) {
    if (cache[fqdn]) {
      cb(null, cache[fqdn]);
    } else {
      var reply = storage.getItem(fqdn);
      cache[fqdn] = reply;
      cb(null, reply)
    }
  },

  /* Set a proxy target */
  set: function (fqdn, target, cb) {
    var reply = storage.getItem(fqdn);
    storage.setItem(fqdn, target)
    cache[fqdn] = target;
    cb(null, target);
  },

  unset: function(fqdn, cb) {
    storage.removeItem(fqdn)
    delete cache[fqdn]
    cb(null)
  },

  clearAll: function() {
    storage.clear()
    cache = {}
  }
}
