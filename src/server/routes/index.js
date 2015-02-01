var version = require('../../../package').version
  , router = module.exports = require('express').Router()

router.get('/version', function(req, res) {
  res.json({ version: version });
})
require('./proxies')(router)
require('./drops')(router)
