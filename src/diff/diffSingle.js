'use strict';

const { fetchPathname } = require('../client');
const { parse } = require('../parser');
const { processReplacements } = require('../utils');

async function diffSingle(pathname, config, requestOptions) {
    const { currentServerData, currentClientData, candidateServerData, candidateClientData } = await fetchPathname(
        pathname,
        config,
        requestOptions
    );

    const { currentServer, currentClient, candidateServer, candidateClient } = parseData(
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
        target: processReplacements(redirect.target, config),
        url: processReplacements(redirect.url, config),
    }));
}

function parseData({ currentServerData, currentClientData, candidateServerData, candidateClientData }, config) {
    const currentServer = parse(processReplacements(config, currentServerData.html));
    const currentClient = parse(processReplacements(config, currentClientData.html));
    const candidateServer = parse(processReplacements(config, candidateServerData.html));
    const candidateClient = parse(processReplacements(config, candidateClientData.html));

    return { currentServer, currentClient, candidateServer, candidateClient };
}

module.exports = {
    diffSingle,
    parseData,
    transformData,
};
