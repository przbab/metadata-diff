import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { getLogger, initializeLogger } from './logger.js';
import { getConfig } from './config/index.js';
import save from './save.js';
import { diffAll } from './diff/index.js';
import { report } from './report/index.js';

const argv = yargs(hideBin(process.argv))
    .usage('Usage: $0 [options]')
    .option('config', {
        alias: 'c',
        describe: 'Specify configuration file to use',
        required: true,
        type: 'string',
    })
    .option('logLevel', {
        choices: ['error', 'warn', 'info', 'verbose', 'debug', 'silly'],
        default: 'info',
        describe: 'Set the log level',
        type: 'string',
    })
    .option('logToFile', {
        default: false,
        describe: 'Output log to file',
        type: 'boolean',
    })
    .option('logFilename', {
        default: 'metadata-diff.log',
        describe: 'Output log filename',
        type: 'string',
    })
    .strict()
    .help('help')
    .alias('h', 'help')
    .alias('v', 'version')
    .version()
    .parse();

async function full(cliConfig) {
    initializeLogger(cliConfig);
    const logger = getLogger();
    logger.silly('Started with cli options', cliConfig);

    const config = await getConfig(cliConfig);
    logger.silly('Running with configuration', config);

    try {
        const diffs = await diffAll(config);
        const html = await report(config, diffs);
        await save(html, config);
    } catch (err) {
        logger.error(err);
        process.exit(1);
    }

    process.exit(0);
}

full(argv);
