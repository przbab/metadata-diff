// eslint-disable-next-line import/no-unresolved
import got from 'got';

export async function fetchSSR(url, options = {}) {
    const redirects = [];
    try {
        const response = await got(url, {
            headers: options.headers,
            hooks: {
                beforeRedirect: [
                    (_, res) => {
                        redirects.push({
                            status: res.statusCode,
                            target: res.headers.location,
                            url: res.url,
                        });
                    },
                ],
            },
            https: { rejectUnauthorized: false },
        });

        return { html: response.body, redirects, statusCode: response.statusCode };
    } catch (err) {
        return { html: err.response?.body, redirects, statusCode: err.response.statusCode };
    }
}
