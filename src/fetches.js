'use strict';

const got = require('got');
const renderHTML = require('./client');

async function fetchSSR(url, options = {}) {
    const redirects = [];
    const response = await got(url, {
        headers: {
            'User-Agent': options.userAgent,
        },
    }).on('redirect', chainedResponse => {
        redirects.push({
            status: chainedResponse.statusCode,
            target: chainedResponse.headers.location,
            url: chainedResponse.requestUrl,
        });
    });

    return { html: response.body, redirects };
}

function fetchClient(url, options) {
    return renderHTML(url, options);
}

module.exports = {
    fetchClient,
    fetchSSR,
};
