'use strict';

const fs = require('fs');
const { promisify } = require('util');
const { getLogger } = require('./logger');

const writeFile = promisify(fs.writeFile);

async function save(report, config) {
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

module.exports = save;
