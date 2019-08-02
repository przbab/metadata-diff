#!/usr/bin/env node

'use strict';

const argv = require('yargs')
    .usage('Usage: $0 [options]')
    .option('config', {
        alias: 'c',
        describe: 'Specify configuration file to use',
        nargs: 1,
        type: 'string',
    })
    .option('output', {
        alias: 'o',
        describe: 'Specify file to write report to',
        nargs: 1,
        type: 'string',
    })
    .option('minify', {
        alias: 'm',
        describe: 'Override minify option',
        nargs: 1,
        type: 'boolean',
    })
    .option('currentBaseUrl', {
        alias: ['current', 'p'],
        describe: 'Override currentBaseUrl',
        nargs: 1,
        type: 'string',
    })
    .option('candidateBaseUrl', {
        alias: ['candidate', 'b'],
        describe: 'Override candidateBaseUrl',
        nargs: 1,
        type: 'string',
    })
    .option('concurrency', {
        describe: 'Specify how many diffs can run in parallel',
        nargs: 1,
        type: 'number',
    })
    .option('logToFile', {
        alias: 'l',
        describe: 'Output log to file',
        nargs: 1,
        type: 'boolean',
    })
    .option('logFilename', {
        describe: 'Output log filename',
        nargs: 1,
        type: 'string',
    })
    .strict()
    .help('help')
    .alias('h', 'help')
    .alias('v', 'version')
    .version().argv;

const allowed = [
    'config',
    'output',
    'minify',
    'currentBaseUrl',
    'candidateBaseUrl',
    'concurrency',
    'logToFile',
    'logFilename',
];

const filteredOptions = Object.keys(argv)
    .filter(key => allowed.includes(key))
    .reduce((acc, key) => {
        acc[key] = argv[key];

        return acc;
    }, {});

require('../src/index').full({ config: filteredOptions });
