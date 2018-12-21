'use strict';

const { fetchSSR, fetchClient } = require('./src/fetches');
const generateReport = require('./src/report');
const diff = require('./src/diff');
const parse = require('./src/parser');
const getConfig = require('./src/config');

async function main() {
    const config = getConfig();
    const diffs = [];
    /* eslint-disable no-await-in-loop */
    for (let i = 0; i < config.pathnames.length; i++) {
        const pathname = config.pathnames[i];
        console.info(`Processing ${i + 1}/${config.pathnames.length}: ${pathname}`);

        const current = config.currentBaseUrl + pathname;
        const candidate = config.candidateBaseUrl + pathname;

        const currentServerHtml = await fetchSSR(current);
        const currentClientHtml = await fetchClient(current);
        const candidateServerHtml = await fetchSSR(candidate);
        const candidateClientHtml = await fetchClient(candidate);

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

main();
