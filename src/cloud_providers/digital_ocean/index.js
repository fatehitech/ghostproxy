var CreateServer = require('./create_server')
  , DestroyServer = require('./destroy_server')

module.exports = function(clientConfig) {
  var client = require('./client')(clientConfig)

  return {
    createServer: CreateServer(client),
    destroyServer: DestroyServer(client)
  }
}
