import { getLogger } from '../logger.js';
import { processReplacements } from '../utils/index.js';

export async function diffSingle(pathname, config, requestOptions) {
    const logger = getLogger();

    logger.verbose(`Diffing pathname ${pathname}`);
    const { fetchPathname } = await import('../client/index.js');

    const { candidateClientData, candidateServerData, currentClientData, currentServerData } = await fetchPathname(
        pathname,
        config,
        requestOptions
    );

    logger.debug(`Pathname ${pathname} fetched`);

    const { candidateClient, candidateServer, currentClient, currentServer } = await parseData(
        { candidateClientData, candidateServerData, currentClientData, currentServerData },
        config
    );

    logger.debug(`Pathname ${pathname} parsed`);

    return {
        candidate: {
            client: transformData(candidateClient, candidateClientData, config),
            server: transformData(candidateServer, candidateServerData, config),
        },
        client: {
            candidate: transformData(candidateClient, candidateClientData, config),
            current: transformData(currentClient, currentClientData, config),
        },
        pathname,
        server: {
            candidate: transformData(candidateServer, candidateServerData, config),
            current: transformData(currentServer, currentServerData, config),
        },
    };
}

export function transformData(parsedData, rawData, config) {
    return {
        ...parsedData,
        metadata: {
            ...parsedData.metadata,
            statusCode: rawData.statusCode,
        },
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

export async function parseData(
    { candidateClientData, candidateServerData, currentClientData, currentServerData },
    config
) {
    const processReplacementsWithConfig = processReplacements(config);
    const { parse } = await import('../parser.js');

    const currentServer = parse(processReplacementsWithConfig(currentServerData.html));
    const currentClient = parse(processReplacementsWithConfig(currentClientData.html));
    const candidateServer = parse(processReplacementsWithConfig(candidateServerData.html));
    const candidateClient = parse(processReplacementsWithConfig(candidateClientData.html));

    return { candidateClient, candidateServer, currentClient, currentServer };
}
