import { fetchSSR } from './ssr.js';
import { fetchClient } from './client.js';

export async function fetchPathname(pathname, config, requestOptions) {
    const current = new URL(config.currentBaseUrl);
    const candidate = new URL(config.candidateBaseUrl);

    current.pathname = pathname;
    candidate.pathname = pathname;

    const decodedCurrentHref = decodeURIComponent(current.href);
    const decodedCandidateHref = decodeURIComponent(candidate.href);

    if (config.ssrOnly) {
        const [currentServerData, candidateServerData] = await Promise.all([
            fetchSSR(decodedCurrentHref, requestOptions),
            fetchSSR(decodedCandidateHref, requestOptions),
        ]);

        return { candidateClientData: null, candidateServerData, currentClientData: null, currentServerData };
    }

    const [currentServerData, currentClientData, candidateServerData, candidateClientData] = await Promise.all([
        fetchSSR(decodedCurrentHref, requestOptions),
        fetchClient(decodedCurrentHref, requestOptions),
        fetchSSR(decodedCandidateHref, requestOptions),
        fetchClient(decodedCandidateHref, requestOptions),
    ]);

    return { candidateClientData, candidateServerData, currentClientData, currentServerData };
}
