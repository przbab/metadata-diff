'use strict';

const { fetchSSR, fetchClient } = require('./fetches');
const generateReport = require('./report');
const parse = require('./parser');
const getConfig = require('./config');
const prepareHtml = require('./html');
const save = require('./save');

async function full() {
    const html = await report();
    const config = getConfig();
    await save(html, config);
    console.info(`Saved report`);

    process.exit(0);
}

async function report() {
    const config = getConfig();
    const diffs = await diff();

    return generateReport(
        { date: new Date(), diffs, currentBaseUrl: config.currentBaseUrl, candidateBaseUrl: config.candidateBaseUrl },
        config
    );
}

async function diff() {
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

module.exports = {
    diff,
    fetchClient,
    fetchSSR,
    full,
    parse,
    prepareHtml,
    report,
};
