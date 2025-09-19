import got from 'got';

export async function fetchSSR(url, options = {}) {
    const redirects = [];
    try {
        const response = await got(url, {
            headers: options.headers,
        }).on('redirect', (chainedResponse) => {
            redirects.push({
                status: chainedResponse.statusCode,
                target: chainedResponse.headers.location,
                url: chainedResponse.requestUrl,
            });
        });

        return { html: response.body, redirects, statusCode: response.statusCode };
    } catch (err) {
        return { html: err.response?.body, redirects, statusCode: err.response.statusCode };
    }
}
