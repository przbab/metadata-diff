'use strict';

const { fetchClient } = require('./client');
const { fetchPathname } = require('./fetchPathname');
const { fetchSSR } = require('./ssr');

module.exports = {
    fetchClient,
    fetchPathname,
    fetchSSR,
};
