const winston = require('winston');
const path = require('path');
const { logDir, logFileName } = require('./config');

// 文件日志格式
const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(({ timestamp, level, message }) => `${timestamp} ${level} ${message}`)
);

// 控制台日志格式
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(({ timestamp, level, message }) => `${timestamp} ${level} ${message}`)
);
// 创建日志记录器
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