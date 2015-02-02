var logger = require('../../logger')

module.exports = function(client) {
  return function(id, done) {
    client.removeDroplet(id).then(function() {
      logger.info('removed droplet '+id)
      done(null)
    }).catch(done).error(done)
  }
}
