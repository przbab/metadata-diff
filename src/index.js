'use strict';

const jsondiffpatch = require('jsondiffpatch');
const generateReport = require('./report');
const { fetchSSR, fetchClient } = require('./fetches');
const parse = require('./parser');
const getConfig = require('./config');
const { prepareUrls, prepareRedirects } = require('./urls');
const save = require('./save');

const jsondiff = jsondiffpatch.create({});

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
        {
            date: new Date(),
            diffs: diffs.map(pathname => ({
                pathname: pathname.pathname,
                candidate: processCandidateDiff(pathname.candidate),
                client: processDiff(pathname.client),
                server: processDiff(pathname.server),
            })),
            currentBaseUrl: config.currentBaseUrl,
            candidateBaseUrl: config.candidateBaseUrl,
        },
        config
    );
}

function processCandidateDiff(data) {
    const [leftMatchedMicrodata, rightMatchedMicrodata] = matchMicrodataItems(
        data.server.microdata,
        data.client.microdata
    );
    const metadataDelta = jsondiff.diff(data.server.metadata, data.client.metadata) || {};
    const microdataDelta = jsondiff.diff(leftMatchedMicrodata, rightMatchedMicrodata) || {};
    const redirectsDelta = jsondiff.diff(data.server.redirects, data.client.redirects) || {};
    return {
        metadata: {
            all: Object.keys(data.server.metadata).length,
            delta: metadataDelta,
            differences: Object.keys(metadataDelta).length,
            left: data.server.metadata,
        },
        microdata: {
            all: Object.keys(leftMatchedMicrodata).length,
            delta: microdataDelta,
            differences: Object.keys(microdataDelta).length,
            left: data.server.microdata,
        },
        redirects: {
            all: Object.keys(data.server.redirects).length,
            delta: redirectsDelta,
            differences: Object.keys(redirectsDelta).length,
            left: data.server.redirects,
        },
    };
}

function processDiff(data) {
    const [leftMatchedMicrodata, rightMatchedMicrodata] = matchMicrodataItems(
        data.current.microdata,
        data.candidate.microdata
    );
    const metadataDelta = jsondiff.diff(data.current.metadata, data.candidate.metadata) || {};
    const microdataDelta = jsondiff.diff(leftMatchedMicrodata, rightMatchedMicrodata) || {};
    const redirectsDelta = jsondiff.diff(data.current.redirects, data.candidate.redirects) || {};
    return {
        metadata: {
            all: Object.keys(data.current.metadata).length,
            delta: metadataDelta,
            differences: Object.keys(metadataDelta).length,
            left: data.current.metadata,
        },
        microdata: {
            all: Object.keys(data.current.microdata).length,
            delta: microdataDelta,
            differences: Object.keys(microdataDelta).length,
            left: data.current.microdata,
        },
        redirects: {
            all: Object.keys(data.current.redirects).length,
            delta: redirectsDelta,
            differences: Object.keys(redirectsDelta).length,
            left: data.current.redirects,
        },
    };
}

function matchMicrodataItems(leftMicrodata, rightMicrodata) {
    const left = {};
    const right = {};
    leftMicrodata.items.forEach(item => {
        const type = (item.type && item.type[0]) || 'Unspecified Type';
        if (!left[type]) {
            left[type] = [];
        }
        left[type].push(item.properties);
    });
    rightMicrodata.items.forEach(item => {
        const type = (item.type && item.type[0]) || 'Unspecified Type';
        if (!right[type]) {
            right[type] = [];
        }
        right[type].push(item.properties);
    });

    return [left, right];
}

async function diff() {
    const config = getConfig();
    const requestOptions = getRequestOptions(config);
    const diffs = [];

    /* eslint-disable no-await-in-loop */
    for (let i = 0; i < config.pathnames.length; i++) {
        const pathname = config.pathnames[i];
        console.info(`Processing ${i + 1}/${config.pathnames.length}: ${pathname}`);

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

        diffs.push({
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
    prepareUrls,
    report,
};
