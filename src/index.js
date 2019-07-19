'use strict';

const { fetchSSR, fetchClient } = require('./client/ssr');
const { parse } = require('./parser');
const { getConfig } = require('./config');
const save = require('./save');
const { diffAll } = require('./diff');
const { report } = require('./report');

const withConfig = wrappedFunction => ({ config: overrideConfig, skipConfig } = {}, ...rest) => {
    const config = getConfig(overrideConfig, skipConfig);
    return wrappedFunction(config, ...rest);
};

async function full(config) {
    try {
        const diffs = await diffAll(config);
        const html = await report(config, diffs);
        await save(html, config);
        console.info(`Saved report to ${config.output}`);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }

    process.exit(0);
}

module.exports = {
    diff: withConfig(diffAll),
    fetchClient,
    fetchSSR,
    full: withConfig(full),
    parse,
    report: withConfig(report),
};
