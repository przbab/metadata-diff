'use strict';

const { fetchPathname } = require('../client');
const { parse } = require('../parser');
const { prepareUrls } = require('../urls');

async function diffSingle(pathname, config, requestOptions) {
    const { currentServerData, currentClientData, candidateServerData, candidateClientData } = await fetchPathname(
        pathname,
        config,
        requestOptions
    );

    const { currentServer, currentClient, candidateServer, candidateClient } = await parseData(
        { currentServerData, currentClientData, candidateServerData, candidateClientData },
        config
    );

    return {
        pathname,
        candidate: {
            server: transformData(candidateServer, candidateServerData, config),
            client: transformData(candidateClient, candidateClientData, config),
        },
        client: {
            current: transformData(currentClient, currentClientData, config),
            candidate: transformData(candidateClient, candidateClientData, config),
        },
        server: {
            current: transformData(currentServer, currentServerData, config),
            candidate: transformData(candidateServer, candidateServerData, config),
        },
    };
}

function transformData(parsedData, rawData, config) {
    return {
        ...parsedData,
        redirects: prepareRedirects(rawData.redirects, config),
    };
}

function prepareRedirects(redirects, config) {
    return redirects.map(redirect => ({
        ...redirect,
        target: prepareUrls(redirect.target, config),
        url: prepareUrls(redirect.url, config),
    }));
}

async function parseData({ currentServerData, currentClientData, candidateServerData, candidateClientData }, config) {
    const [currentServer, currentClient, candidateServer, candidateClient] = await Promise.all([
        parse(prepareUrls(currentServerData.html, config)),
        parse(prepareUrls(currentClientData.html, config)),
        parse(prepareUrls(candidateServerData.html, config)),
        parse(prepareUrls(candidateClientData.html, config)),
    ]);

    return { currentServer, currentClient, candidateServer, candidateClient };
}

module.exports = {
    diffSingle,
    parseData,
    transformData,
};
