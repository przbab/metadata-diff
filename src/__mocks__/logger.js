'use strict';

module.exports = {
    getLogger: () => ({
        debug: () => null,
        error: () => null,
        info: () => null,
        silly: () => null,
        verbose: () => null,
        warn: () => null,
    }),
    initializeLogger: () => null,
};
