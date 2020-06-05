'use strict';

const { getLogger } = require('../logger');
const { fetchPathname } = require('../client');
const { parse } = require('../parser');
const { processReplacements } = require('../utils');

async function diffSingle(pathname, config, requestOptions) {
    const logger = getLogger();

    logger.verbose(`Diffing pathname ${pathname}`);

    const { currentServerData, currentClientData, candidateServerData, candidateClientData } = await fetchPathname(
        pathname,
        config,
        requestOptions
    );

    logger.debug(`Pathname ${pathname} fetched`);

    const { currentServer, currentClient, candidateServer, candidateClient } = parseData(
        { currentServerData, currentClientData, candidateServerData, candidateClientData },
        config
    );

    logger.debug(`Pathname ${pathname} parsed`);

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
    const processReplacementsWithConfig = processReplacements(config);

    return redirects.map((redirect) => ({
        ...redirect,
        target: processReplacementsWithConfig(redirect.target),
        url: processReplacementsWithConfig(redirect.url),
    }));
}

function parseData({ currentServerData, currentClientData, candidateServerData, candidateClientData }, config) {
    const processReplacementsWithConfig = processReplacements(config);

    const currentServer = parse(processReplacementsWithConfig(currentServerData.html));
    const currentClient = parse(processReplacementsWithConfig(currentClientData.html));
    const candidateServer = parse(processReplacementsWithConfig(candidateServerData.html));
    const candidateClient = parse(processReplacementsWithConfig(candidateClientData.html));

    return { currentServer, currentClient, candidateServer, candidateClient };
}

module.exports = {
    diffSingle,
    parseData,
    transformData,
};
