'use strict';

module.exports = {
    getLogger: () => ({
        error: console.error,
        warn: console.warn,
        info: console.info,
        verbose: console.log,
        debug: console.debug,
        silly: console.log,
    }),
    initializeLogger: () => null,
};
