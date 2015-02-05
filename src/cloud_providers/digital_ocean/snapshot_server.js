var logger = require('../../logger')

module.exports = function(client) {
  var shutdown = client.dropletActions.shutdown;
  var snapshot = client.dropletActions.snapshot;
  return function(id, done) {
    var snapshotReply = null;
    console.log('shutdown');
    shutdown(id,  function(err, reply) {
      if (err) logger.error(err.stack);
      console.log('shutdown reply', reply);
      setTimeout(function() {
        console.log('snappy');
        snapshot(id, 'My Snapshot', function(err, reply) {
          if (err) logger.error(err.stack);
          logger.info("snapshot successful", reply);
          return done(err, reply);
        })
      }, 10000);
    })
  }
}
