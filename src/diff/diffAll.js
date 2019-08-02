'use strict';

const mapLimit = require('async/mapLimit');
const { getLogger } = require('../logger');
const { get, getOr } = require('../utils');
const { diffSingle } = require('./diffSingle');

function getPathname(pathname) {
    if (typeof pathname === 'string') {
        return pathname;
    }

    return get('path', pathname);
}

function processPathnames(config) {
    const logger = getLogger();
    const requestOptions = getRequestOptions(config);

    return async pathnameObject => {
        const pathname = getPathname(pathnameObject);

        logger.info(`Processing ${pathname}`);

        return {
            ...(await diffSingle(pathname, config, requestOptions)),
            note: getOr('', 'note', pathnameObject),
        };
    };
}

async function diffAll(config) {
    const logger = getLogger();

    logger.verbose('Diffing all the files');

    return mapLimit(config.pathnames, config.concurrency, processPathnames(config));
}

function getRequestOptions(config) {
    return {
        ...config.puppeteerOptions,
        userAgent: config.userAgent,
    };
}

module.exports = { diffAll };
