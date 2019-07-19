'use strict';

const winston = require('winston');

let logger;

function initializeLogger(config) {
    logger = winston.createLogger({
        level: config.logLevel,
        format: winston.format.json(),
        transports: [new winston.transports.Console()],
    });
}

function getLogger() {
    return logger;
}

module.exports = { getLogger, initializeLogger };
