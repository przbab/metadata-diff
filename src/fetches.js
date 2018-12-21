'use strict';

const fetch = require('node-fetch');
const renderHTML = require('./client');

async function fetchSSR(url, options = {}) {
    const data = await fetch(url, {
        headers: {
            'User-Agent': options.userAgent,
        },
    });
    const text = await data.text();

    return text;
}

function fetchClient(url) {
    return renderHTML(url);
}

module.exports = {
    fetchClient,
    fetchSSR,
};
