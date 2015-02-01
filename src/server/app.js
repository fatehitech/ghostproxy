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

// Cross Domain
var allowCrossDomain = function(req, res, next) {
  res.header("Access-Control-Allow-Origin", process.env.ALLOW_ORIGIN || "*");
  res.header("Access-Control-Expose-Headers", "X-Filename");
  res.header("Access-Control-Allow-Headers", "Referer, Range, Accept-Encoding, Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
  next();
};

api.app.use('/api/v1/', allowCrossDomain, require('./routes'));

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
