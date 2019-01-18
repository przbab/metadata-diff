'use strict';

const { fetchSSR, fetchClient } = require('./fetches');
const parse = require('./parser');
const getConfig = require('./config');
const { prepareUrls } = require('./urls');
const save = require('./save');
const diff = require('./diff');
const report = require('./report');

const withConfig = wrappedFunction => ({ config: overrideConfig, skipConfig, ...options } = {}, ...rest) => {
    const config = getConfig(options, skipConfig, overrideConfig);
    return wrappedFunction(config, ...rest);
};

async function full(config) {
    const diffs = await diff(config);
    const html = await report(config, diffs);
    await save(html, config);
    console.info(`Saved report`);

    process.exit(0);
}

module.exports = {
    diff: withConfig(diff),
    fetchClient,
    fetchSSR,
    full: withConfig(full),
    parse,
    prepareUrls,
    report: withConfig(report),
};
