'use strict';

const fs = require('fs');
const path = require('path');

const CONFIG_FILES = ['.metadatadiffrc', '.metadatadiffrc.json', 'package.json'];

function getConfig() {
    const directory = './';
    const configFile = getFilenameForDirectory(directory);
    if (configFile === 'package.json') {
        return readPackageJsonForDirectory(directory);
    }
    if (configFile) {
        return readConfigFileForDirectory(directory, configFile);
    }
    throw new Error('Configuration not found');
}

function getFilenameForDirectory(directory) {
    return CONFIG_FILES.find(filename => fs.existsSync(path.join(directory, filename)));
}

function readConfigFileForDirectory(directory, filename) {
    const file = fs.readFileSync(path.join(directory, filename), 'utf-8');
    try {
        return JSON.parse(file);
    } catch (err) {
        throw new Error('Malformed config');
    }
}

function readPackageJsonForDirectory(directory) {
    const file = readConfigFileForDirectory(path.join(directory, 'package.json'));
    if (file.metadataDiff) {
        return file.metadataDiff;
    }
    throw new Error('Configuration not found');
}

module.exports = getConfig;
