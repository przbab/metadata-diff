'use strict';

const { diffSingle } = require('./diffSingle');

async function diffAll(config) {
    const requestOptions = getRequestOptions(config);

    const diffs = [];

    /* eslint-disable no-await-in-loop */
    for (let i = 0; i < config.pathnames.length; i++) {
        const pathname = config.pathnames[i];
        console.info(`Processing ${i + 1}/${config.pathnames.length}: ${pathname}`);
        diffs.push(await diffSingle(pathname, config, requestOptions));
    }
    return diffs;
    /* eslint-enable */
}

function getRequestOptions(config) {
    return {
        ...config.puppeteerOptions,
        userAgent: config.userAgent,
    };
}

module.exports = { diffAll };
