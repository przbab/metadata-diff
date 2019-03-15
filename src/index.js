'use strict';

const { fetchSSR, fetchClient } = require('./client/ssr');
const { parse } = require('./parser');
const { getConfig } = require('./config');
const { prepareUrls } = require('./urls');
const save = require('./save');
const { diffAll } = require('./diff');
const { report } = require('./report');

const withConfig = wrappedFunction => ({ config: overrideConfig, skipConfig, ...options } = {}, ...rest) => {
    const config = getConfig(options, skipConfig, overrideConfig);
    return wrappedFunction(config, ...rest);
};

async function full(config) {
    try {
        const diffs = await diffAll(config);
        const html = await report(config, diffs);
        await save(html, config);
        console.info(`Saved report`);
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
    prepareUrls,
    report: withConfig(report),
};
