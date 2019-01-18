'use strict';

const { fetchSSR, fetchClient } = require('./fetches');
const parse = require('./parser');
const { prepareUrls, prepareRedirects } = require('./urls');

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

async function diffSingle(pathname, config, requestOptions) {
    const current = new URL(config.currentBaseUrl);
    const candidate = new URL(config.candidateBaseUrl);

    current.pathname = pathname;
    candidate.pathname = pathname;

    const [currentServerHtml, currentClientHtml, candidateServerHtml, candidateClientHtml] = await Promise.all([
        fetchSSR(current.href, requestOptions),
        fetchClient(current.href, requestOptions),
        fetchSSR(candidate.href, requestOptions),
        fetchClient(candidate.href, requestOptions),
    ]);

    const [currentServerData, currentClientData, candidateServerData, candidateClientData] = await Promise.all([
        parse(prepareUrls(currentServerHtml.html, config)),
        parse(prepareUrls(currentClientHtml.html, config)),
        parse(prepareUrls(candidateServerHtml.html, config)),
        parse(prepareUrls(candidateClientHtml.html, config)),
    ]);

    return {
        pathname,
        candidate: {
            server: {
                metadata: candidateServerData.metadata,
                microdata: candidateServerData.microdata,
                redirects: prepareRedirects(candidateServerHtml.redirects, config),
            },
            client: {
                metadata: candidateClientData.metadata,
                microdata: candidateClientData.microdata,
                redirects: prepareRedirects(candidateClientHtml.redirects, config),
            },
        },
        client: {
            current: {
                metadata: currentClientData.metadata,
                microdata: currentClientData.microdata,
                redirects: prepareRedirects(currentClientHtml.redirects, config),
            },
            candidate: {
                metadata: candidateClientData.metadata,
                microdata: candidateClientData.microdata,
                redirects: prepareRedirects(candidateClientHtml.redirects, config),
            },
        },
        server: {
            current: {
                metadata: currentServerData.metadata,
                microdata: currentServerData.microdata,
                redirects: prepareRedirects(currentServerHtml.redirects, config),
            },
            candidate: {
                metadata: candidateServerData.metadata,
                microdata: candidateServerData.microdata,
                redirects: prepareRedirects(candidateServerHtml.redirects, config),
            },
        },
    };
}

function getRequestOptions(config) {
    return {
        ...config.puppeteerOptions,
        userAgent: config.userAgent,
    };
}

module.exports = diffAll;
