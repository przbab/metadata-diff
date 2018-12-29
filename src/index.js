'use strict';

const { fetchSSR, fetchClient } = require('./fetches');
const generateReport = require('./report');
const parse = require('./parser');
const getConfig = require('./config');
const prepareHtml = require('./html');

async function full() {
    const config = getConfig();
    const requestOptions = getRequestOptions(config);
    const diffs = [];
    /* eslint-disable no-await-in-loop */
    for (let i = 0; i < config.pathnames.length; i++) {
        const pathname = config.pathnames[i];
        console.info(`Processing ${i + 1}/${config.pathnames.length}: ${pathname}`);

        const current = config.currentBaseUrl + pathname;
        const candidate = config.candidateBaseUrl + pathname;

        const [currentServerHtml, currentClientHtml, candidateServerHtml, candidateClientHtml] = await Promise.all([
            fetchSSR(current, requestOptions),
            fetchClient(current, requestOptions),
            fetchSSR(candidate, requestOptions),
            fetchClient(candidate, requestOptions),
        ]);

        const [
            currentServerMetadata,
            currentClientMetadata,
            candidateServerMetadata,
            candidateClientMetadata,
        ] = await Promise.all([
            parse(prepareHtml(currentServerHtml, config)),
            parse(prepareHtml(currentClientHtml, config)),
            parse(prepareHtml(candidateServerHtml, config)),
            parse(prepareHtml(candidateClientHtml, config)),
        ]);

        diffs.push({
            pathname,
            candidate: { server: candidateServerMetadata, client: candidateClientMetadata },
            client: { current: currentClientMetadata, candidate: candidateClientMetadata },
            server: { current: currentServerMetadata, candidate: candidateServerMetadata },
        });
        /* eslint-enable */
    }

    console.info(`Saved report`);

    await generateReport({ date: new Date(), diffs }, config);

    process.exit(0);
}

function getRequestOptions(config) {
    return {
        ...config.puppeteerOptions,
        userAgent: config.userAgent,
    };
}

module.exports = {
    fetchClient,
    fetchSSR,
    full,
    parse,
    prepareHtml,
};
