#!/usr/bin/env node
var logger = require('./src/logger')
  , app = require('./src/app')
  , fs = require('fs')
  , prod = process.env.NODE_ENV === 'production'

var ports = {
  proxy: {
    http: prod ? 80 : 4080,
    https: prod ? 443 : 4443
  }
}

app.proxy.createServer().listen(ports.proxy.http);
logger.info("proxy listening on http://0.0.0.0:"+ports.proxy.http);

var proxyConfig = null;
if (process.env.SSL_KEY_PATH && process.env.SSL_CERT_PATH) {
  app.proxy.createServer({
    ssl: {
      key: fs.readFileSync(process.env.SSL_KEY_PATH),
      cert: fs.readFileSync(process.env.SSL_CERT_PATH),
      secureProtocol: 'TLSv1_method'
    }
  }).listen(ports.proxy.https)
  logger.info("proxy listening on https://0.0.0.0:"+ports.proxy.https);
} else {
  logger.warn('no ssl -- set SSL_KEY_PATH and SSL_CERT_PATH!')
}
