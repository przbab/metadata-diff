import async from 'async';
import { getLogger } from '../logger.js';

function extractPathnames(pathnameObject) {
    return pathnameObject.reduce((acc, item) => {
        if (typeof item === 'string') {
            acc.push(item);
        } else if (item.path) {
            acc.push(item.path);
        } else if (item.pathnames && Array.isArray(item.pathnames)) {
            acc.push(...extractPathnames(item.pathnames));
        }
        return acc;
    }, []);
}

async function processPathnames(config) {
    const logger = getLogger();
    const requestOptions = getRequestOptions(config);
    const { diffSingle } = await import('./diffSingle.js');

    return async (pathname) => {
        logger.info(`Processing ${pathname}`);

        return {
            path: pathname,
            ...(await diffSingle(pathname, config, requestOptions)),
        };
    };
}

function enrichPathnameConfig(pathnameObject, diffedPathnames) {
    return pathnameObject.map((item) => {
        if (typeof item === 'string') {
            return {
                path: item,
                ...diffedPathnames[item][0],
            };
        }
        if (item.pathnames && Array.isArray(item.pathnames)) {
            return {
                ...item,
                pathnames: enrichPathnameConfig(item.pathnames, diffedPathnames),
            };
        }

        return {
            ...item,
            ...diffedPathnames[item.path][0],
        };
    });
}

async function diffAll(config) {
    const logger = getLogger();

    logger.verbose('Diffing all the files');

    const allPathnames = extractPathnames(config.pathnames);
    logger.debug('All pathnames to process', allPathnames);

    const diffedPathnames = Object.groupBy(
        await async.mapLimit(allPathnames, config.concurrency, await processPathnames(config)),
        (item) => item.path
    );

    return enrichPathnameConfig(config.pathnames, diffedPathnames);
}

function getRequestOptions(config) {
    return {
        ...config.puppeteerOptions,
        headers: config.headers,
        userAgent: config.userAgent,
    };
}

export { diffAll };
