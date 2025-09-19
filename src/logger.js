import winston from 'winston';

let logger;

export function initializeLogger(config) {
    logger = winston.createLogger({
        format: winston.format.json(),
        level: config.logLevel,
        transports: [new winston.transports.Console()],
    });

    if (config.logToFile) {
        logger.add(new winston.transports.File({ filename: config.logFilename }));
    }
}

export function getLogger() {
    return logger;
}
