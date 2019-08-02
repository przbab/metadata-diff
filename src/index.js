'use strict';

const { getLogger, initializeLogger } = require('./logger');
const { getConfig } = require('./config');
const save = require('./save');
const { diffAll } = require('./diff');
const { report } = require('./report');

const withConfig = wrappedFunction => ({ config: overrideConfig, skipConfig } = {}, ...rest) => {
    const config = getConfig(overrideConfig, skipConfig);
    initializeLogger(config);
    const logger = getLogger();
    logger.silly(config);

    return wrappedFunction(config, ...rest);
};

async function full(config) {
    const logger = getLogger();

    try {
        const diffs = await diffAll(config);
        const html = await report(config, diffs);
        await save(html, config);
    } catch (err) {
        logger.error(err);
        process.exit(1);
    }

    process.exit(0);
}

module.exports = {
    diff: withConfig(diffAll),
    full: withConfig(full),
    report: withConfig(report),
};
