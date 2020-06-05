'use strict';

const got = require('got');

async function fetchSSR(url, options = {}) {
    const redirects = [];
    try {
        const response = await got(url, {
            headers: {
                'User-Agent': options.userAgent,
            },
        }).on('redirect', (chainedResponse) => {
            redirects.push({
                status: chainedResponse.statusCode,
                target: chainedResponse.headers.location,
                url: chainedResponse.requestUrl,
            });
        });

        return { html: response.body, redirects };
    } catch (err) {
        return { html: err.body, redirects };
    }
}

module.exports = {
    fetchSSR,
};
