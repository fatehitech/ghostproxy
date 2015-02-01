var winston = require('winston')

var consoleTransport = new winston.transports.Console({
  colorize: true
})

var logger = new winston.Logger({
  transports: [
    consoleTransport
  ],
  levels: {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  }
})

module.exports = logger;
