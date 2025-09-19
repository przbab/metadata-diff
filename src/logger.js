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
    if (process.env.NODE_ENV === 'test') {
        return {
            debug: () => {},
            error: () => {},
            info: () => {},
            verbose: () => {},
            warn: () => {},
        };
    }
    if (!logger) {
        throw new Error('Logger not initialized. Please call initializeLogger(config) first.');
    }

    return logger;
}
