import async from 'async';
import { getLogger } from '../logger.js';

function getPathname(pathname) {
    if (typeof pathname === 'string') {
        return pathname;
    }

    return pathname.path;
}

async function processPathnames(config) {
    const logger = getLogger();
    const requestOptions = getRequestOptions(config);
    const { diffSingle } = await import('./diffSingle.js');

    return async (pathnameObject) => {
        const pathname = getPathname(pathnameObject);

        logger.info(`Processing ${pathname}`);

        return {
            ...(await diffSingle(pathname, config, requestOptions)),
            note: pathnameObject.note,
        };
    };
}

async function diffAll(config) {
    const logger = getLogger();

    logger.verbose('Diffing all the files');

    return async.mapLimit(config.pathnames, config.concurrency, await processPathnames(config));
}

function getRequestOptions(config) {
    return {
        ...config.puppeteerOptions,
        headers: config.headers,
        userAgent: config.userAgent,
    };
}

export { diffAll };
