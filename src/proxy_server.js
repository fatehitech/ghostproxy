var logger = require('./logger');
var httpProxy = require('http-proxy');
var proxy = httpProxy.createProxyServer({});
var URI = require('uri-js');
var Ghosts = require('./ghosts');
var GhostRequestHandler = require('./ghost_request_handler');
var RESPONSES = require('./responses');

var handler = function (req, res, cb) {
  var host = req.headers.host
  if (!host) {
    logger.warn('No host header was provided. Returning 404')
    return RESPONSES.notFound(res);
  }
  var fqdn = req.headers.host.split(':')[0];

  Ghosts.findOne({ fqdn: fqdn }).then(function(ghost) {
    if (ghost) {
      var handler = new GhostRequestHandler(ghost);
      handler.handleRequest(req, res, function() {
        var proxyPath = 'http://'+ghost.ipAddress+':'+ghost.httpPort;
        cb(null, { target: URI.parse(proxyPath) }, fqdn);
      });
    } else {
      logger.warn('No path defined for host '+fqdn+'. Returning 404');
      return RESPONSES.notFound(res);
    }
  })
}

proxy.on('error', function(e) {
  logger.error('Proxy error: '+e.message+'\n'+e.stack)
});

var requestListener = function(req, res) {
  handler(req, res, function(err, opts, fqdn) {
    if (err) return RESPONSES.gatewayError(res);
    proxy.web(req, res, opts);
    logger.info('Proxied HTTP '+fqdn+' => '+opts.target.scheme+'://'+opts.target.host+':'+opts.target.port);
  })
}

var websocketListener = function(req, socket, head) {
  handler(req, res, function(err, opts, fqdn) {
    if (err) return RESPONSES.gatewayError(res);
    proxy.ws(req, socket, head, opts);
    logger.info('Proxied WebSocket '+fqdn+' => '+opts.target.scheme+'://'+opts.target.host+':'+opts.target.port);
  })
}

module.exports = function(config) {
  var server = (
    config && config.ssl ?
    require('https').createServer(config.ssl, requestListener) :
    require('http').createServer(requestListener)
  )
  server.on('upgrade', websocketListener)
  return server;
}
