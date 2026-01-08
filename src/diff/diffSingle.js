import { getLogger } from '../logger.js';

export const processReplacements = (config) => (string) => {
    if (!string) {
        return string;
    }

    let output = string;

    Object.entries(config.replacements ?? {}).forEach(([target, sources]) => {
        output = output.replaceAll(new RegExp(sources.map((source) => `(${source})`).join('|'), 'ig'), target);
    });

    return output;
};

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

    if (config.ssrOnly) {
        return {
            candidate: {
                client: null,
                server: transformData(candidateServer, candidateServerData, config),
            },
            current: {
                client: null,
                server: transformData(currentServer, currentServerData, config),
            },
            path: pathname,
        };
    }

    return {
        candidate: {
            client: transformData(candidateClient, candidateClientData, config),
            server: transformData(candidateServer, candidateServerData, config),
        },
        current: {
            client: transformData(currentClient, currentClientData, config),
            server: transformData(currentServer, currentServerData, config),
        },
        path: pathname,
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

    if (config.ssrOnly) {
        const currentServer = parse(processReplacementsWithConfig(currentServerData.html), config);
        const candidateServer = parse(processReplacementsWithConfig(candidateServerData.html), config);

        return { candidateClient: null, candidateServer, currentClient: null, currentServer };
    }

    const currentServer = parse(processReplacementsWithConfig(currentServerData.html), config);
    const currentClient = parse(processReplacementsWithConfig(currentClientData.html), config);
    const candidateServer = parse(processReplacementsWithConfig(candidateServerData.html), config);
    const candidateClient = parse(processReplacementsWithConfig(candidateClientData.html), config);

    return { candidateClient, candidateServer, currentClient, currentServer };
}
