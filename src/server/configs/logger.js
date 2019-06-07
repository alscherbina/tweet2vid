const winston = require('winston');
const fs = require('fs');
const path = require('path');
const config = require('./vars');

const logDir = config.logDirectoryName;
const logLevel = config.env === 'production' ? 'info' : 'debug';

// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.label({ label: path.basename(process.mainModule.filename) }),
    winston.format.errors({ stack: true }),
    winston.format.printf(
      info =>
        `${info.timestamp} ${info.level.toUpperCase()} [${info.label}]: ${info.message}. ${
          info.stack ? `\n${info.stack}` : ''
        }`
    )
  ),
  transports: [
    new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
    new winston.transports.File({ filename: path.join(logDir, 'combined.log') })
  ]
});

if (config.env !== 'production') {
  logger.add(
    new winston.transports.Console({
      level: logLevel,
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          info =>
            `${info.timestamp} ${info.level} [${info.label}]: ${info.message}. ${info.stack ? `\n${info.stack}` : ''}`
        )
      )
    })
  );
}

// For use in Morgan
logger.stream = {
  write: message => {
    logger.info(message.trim());
  }
};

module.exports = logger;
