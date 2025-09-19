'use strict';

const winston = require('winston');

let logger;

function initializeLogger(config) {
    logger = winston.createLogger({
        format: winston.format.json(),
        level: config.logLevel,
        transports: [new winston.transports.Console()],
    });

    if (config.logToFile) {
        logger.add(new winston.transports.File({ filename: config.logFilename }));
    }
}

function getLogger() {
    return logger;
}

module.exports = { getLogger, initializeLogger };
