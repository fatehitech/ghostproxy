var CreateServer = require('./create_server');
var SnapshotServer = require('./snapshot_server');
var DestroyServer = require('./destroy_server');

module.exports = function(clientConfig) {
  var client = require('./client')(clientConfig)

  return {
    createServer: CreateServer(client),
    destroyServer: DestroyServer(client),
    snapshotServer: SnapshotServer(client)
  }
}
