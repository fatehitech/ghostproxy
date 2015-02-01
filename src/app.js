var logger = console
  , express = require('express')
  , api = { app: express() }
  , createProxyServer = require('./proxy_server')

if (process.env.NODE_ENV === "development") {
  logger.info('development mode');

  api.app.use(function (req, res, next) {
    logger.info(req.method + " " + req.path);
    next();
  });
}

api.app.use(function (err, req, res, next) {
  logger.error(err.message)
  logger.error(err.stack);
  next(err);
})

module.exports = {
  api: {
    app: api.app,
    http: require('http').createServer(api.app)
  },
  proxy: { createServer: createProxyServer }
}
