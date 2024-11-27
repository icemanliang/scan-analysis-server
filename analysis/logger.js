const winston = require('winston');
const { combine, timestamp, printf } = winston.format;

const logFormat = printf(({ timestamp, level, message }) => {
  return `${timestamp} [${level}]: ${message}`;
});

const logger = winston.createLogger({
  format: combine(
    timestamp(),
    logFormat
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'application.log' })
  ]
});

module.exports = logger;
