var fs = require('fs');
var path = require('path');

module.exports = {
  gatewayError: function(res) {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.write('Internal Gateway Error\n');
    res.end()
  },
  notFound: function(res) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.write('Not found\n');
    res.end();
  },
  browserLoader: function(res) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    var html = path.join(__dirname, 'browser_loader.html');
    fs.createReadStream(html).pipe(res);
  },
  ok: function(res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write('OK\n');
    res.end();
  }
}
