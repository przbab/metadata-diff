import fs from 'fs';
import { promisify } from 'util';
import { getLogger } from './logger.js';

const writeFile = promisify(fs.writeFile);

export default async function save(report, config) {
    const logger = getLogger();

    try {
        logger.debug('Saving file...');
        await writeFile(config.output, report);
        logger.info(`Saved report to ${config.output}`);
    } catch (err) {
        logger.error('Saving failed', err);
        process.exit(1);
    }
}
