import fsPromises from 'fs/promises';
import { getLogger } from './logger.js';
import path from 'path';

export default async function save(report, config) {
    const logger = getLogger();

    try {
        logger.debug('Saving file...');
        const filename = path.join(config.outputDir, config.output);
        await fsPromises.writeFile(filename, report);
        logger.info(`Saved report to ${filename}`);
    } catch (err) {
        logger.error('Saving failed', err);
        process.exit(1);
    }
}
