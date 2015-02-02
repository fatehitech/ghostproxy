var path = require('path');
var fs = require('fs');
var logger = require('../src/logger');


var Config = {
  mongoURI: 'mongodb://localhost:3001/meteor',
  ssh: {
    publicKeyPath: path.join(__dirname, 'id_rsa.pub')
  }
}

if (!fs.existsSync(Config.ssh.publicKeyPath)){
  logger.error('key pair missing, create it with: ssh-keygen -N "" -f etc/id_rsa');
  process.exit(1);
};

module.exports = Config;
