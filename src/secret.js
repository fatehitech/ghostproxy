var secret = process.env.API_SECRET;
var logger = console
var storage = require('./storage').localStorage

function generateSecret() {
   var s='';
   for(var i=0;i<4;i++) s+=Math.random().toString(36).substring(2);
   return s;
}

if (!secret) {
  secret = storage.getItem('__api_secret')
  if (secret) {
    logger.info('using previously saved secret: '+secret);
  } else {
    secret = generateSecret();
    storage.setItem('__api_secret', secret);
    logger.warn('generated and saved secret: '+secret);
  }
}
else logger.info('Using environment variable API_SECRET. Make sure to use SSL!');

module.exports = secret
