const winston = require('winston');
const path = require('path');
const { logDir, logFileName } = require('./config');

const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(({ timestamp, level, message }) => `${timestamp} ${level} ${message}`)
);

const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(({ timestamp, level, message }) => `${timestamp} ${level} ${message}`)
);

const logger = winston.createLogger({
    level: 'info',
    transports: [
        new winston.transports.File({ 
            dirname: path.join(__dirname, '../', logDir),
            filename: logFileName,
            format: fileFormat,
            options: { flags: 'w' }
        }),
        new winston.transports.Console({
            format: consoleFormat
        })
    ]
});

module.exports = logger;