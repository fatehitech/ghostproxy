var logger = require('./logger');
var httpProxy = require('http-proxy');
var proxy = httpProxy.createProxyServer({});
var URI = require('uri-js');
var Ghosts = require('./ghosts');

var handler = function (req, cb) {
  var host = req.headers.host
  if (!host) {
    logger.warn('No host header was provided. Returning 404')
    return cb(notFound);
  }
  var fqdn = req.headers.host.split(':')[0];
  Ghosts.lookupProxyPath(fqdn).then(function(path) {
    cb(null, { path: URI.parse(path) }, fqdn);
  }, function(err) {
    logger.warn('No path defined for host '+fqdn+'. Returning 404');
    return cb(notFound)
  })
}

proxy.on('error', function(e) {
  logger.error('Proxy error: '+e.message+'\n'+e.stack)
});

var gatewayError = function(res) {
  res.writeHead(502, { 'Content-Type': 'text/plain' });
  res.write('Internal Gateway Error\n');
  res.end()
}

var notFound = function(res) {
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.write('Not found\n');
  res.end();
}

var requestListener = function(req, res) {
  handler(req, function(err, opts, fqdn) {
    if (err) return err(res);
    proxy.web(req, res, opts);
    logger.info('Proxied HTTP '+fqdn+' => '+opts.path.scheme+'://'+opts.path.host+':'+opts.path.port);
  })
}

var websocketListener = function(req, socket, head) {
  handler(req, function(err, opts, fqdn) {
    if (err) return false;
    proxy.ws(req, socket, head, opts);
    logger.info('Proxied WebSocket '+fqdn+' => '+opts.path.scheme+'://'+opts.path.host+':'+opts.path.port);
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
