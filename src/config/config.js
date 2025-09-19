import path from 'path';
import Joi from 'joi';
import { schema } from './schema.js';
import { getLogger } from '../logger.js';

export async function getConfig(cliConfig) {
    const logger = getLogger();
    const configFile = cliConfig.config;
    const configPath = path.resolve(process.cwd(), configFile);

    try {
        const fullConfig = await import(configPath);

        return validateConfig(fullConfig.default);
    } catch (error) {
        logger.error(`Cannot read config file: ${configPath}`, error);

        process.exit(1);
    }

    return null;
}

function validateConfig(config) {
    const { error, value } = Joi.validate(config, schema);
    if (error) {
        throw error;
    }

    return value;
}
