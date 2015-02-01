var logger = require('./logger')
  , createProxyServer = require('./proxy_server')

if (process.env.NODE_ENV === "development") {
  logger.info('development mode');
}

module.exports = {
  proxy: { createServer: createProxyServer }
}
