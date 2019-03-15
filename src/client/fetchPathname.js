'use strict';

const { fetchSSR } = require('./ssr');
const { fetchClient } = require('./client');

async function fetchPathname(pathname, config, requestOptions) {
    const current = new URL(config.currentBaseUrl);
    const candidate = new URL(config.candidateBaseUrl);

    current.pathname = pathname;
    candidate.pathname = pathname;

    const [currentServerData, currentClientData, candidateServerData, candidateClientData] = await Promise.all([
        fetchSSR(current.href, requestOptions),
        fetchClient(current.href, requestOptions),
        fetchSSR(candidate.href, requestOptions),
        fetchClient(candidate.href, requestOptions),
    ]);
    return { currentServerData, currentClientData, candidateServerData, candidateClientData };
}

module.exports = {
    fetchPathname,
};
