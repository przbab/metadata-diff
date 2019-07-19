'use strict';

const { get, getOr } = require('../utils');
const { diffSingle } = require('./diffSingle');

function getPathname(pathname) {
    if (typeof pathname === 'string') {
        return pathname;
    }

    return get('path', pathname);
}

async function diffAll(config) {
    const requestOptions = getRequestOptions(config);

    const diffs = [];

    /* eslint-disable no-await-in-loop */
    for (let i = 0; i < config.pathnames.length; i++) {
        const pathname = getPathname(config.pathnames[i]);
        console.info(`Processing ${i + 1}/${config.pathnames.length}: ${pathname}`);
        diffs.push({
            ...(await diffSingle(pathname, config, requestOptions)),
            note: getOr('', 'note', config.pathnames[i]),
        });
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
