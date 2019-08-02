'use strict';

module.exports = {
    getLogger: () => ({
        error: () => null,
        warn: () => null,
        info: () => null,
        verbose: () => null,
        debug: () => null,
        silly: () => null,
    }),
    initializeLogger: () => null,
};
