'use strict';

const { fetchSSR, fetchClient } = require('./fetches');
const generateReport = require('./report');
const diff = require('./diff');
const parse = require('./parser');
const getConfig = require('./config');

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

        const currentServerHtml = await fetchSSR(current, requestOptions);
        const currentClientHtml = await fetchClient(current, requestOptions);
        const candidateServerHtml = await fetchSSR(candidate, requestOptions);
        const candidateClientHtml = await fetchClient(candidate, requestOptions);

        const [
            currentServerMetadata,
            currentClientMetadata,
            candidateServerMetadata,
            candidateClientMetadata,
        ] = await Promise.all([
            parse(currentServerHtml),
            parse(currentClientHtml),
            parse(candidateServerHtml),
            parse(candidateClientHtml),
        ]);

        diffs.push({
            pathname,
            candidate: diff(candidateServerMetadata, candidateClientMetadata),
            client: diff(currentClientMetadata, candidateClientMetadata),
            server: diff(currentServerMetadata, candidateServerMetadata),
        });
        /* eslint-enable */
    }

    console.info(`Saved report`);

    await generateReport(diffs, config.output);

    process.exit(0);
}

function getRequestOptions(config) {
    return {
        ...config.puppeteerOptions,
        userAgent: config.userAgent,
    };
}

module.exports = {
    full,
};
