'use strict';

const fs = require('fs');
const { promisify } = require('util');

const writeFile = promisify(fs.writeFile);

async function save(report, config) {
    try {
        await writeFile(config.output, report);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

module.exports = save;
