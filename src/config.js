'use strict';

const fs = require('fs');
const path = require('path');
const merge = require('deepmerge');

const CONFIG_FILES = ['.metadatadiffrc', '.metadatadiffrc.json', '.metadatadiffrc.js', 'package.json'];

function getConfig() {
    const directory = './';
    const configFile = getFilenameForDirectory(directory);
    if (!configFile) {
        throw new Error('Configuration not found');
    }
    const config = readFile(path.join(directory, configFile));
    return getConfigEnvironment(config);
}

function readFile(configFile) {
    if (configFile.match(/\.js$/)) {
        // eslint-disable-next-line import/no-dynamic-require
        return require(path.join('../', configFile));
    }
    if (configFile.match(/package.json$/)) {
        return readPackageJson(configFile);
    }
    if (configFile) {
        return readConfigFile(configFile);
    }
    throw new Error('Unsupported configuration file type');
}

function getFilenameForDirectory(directory) {
    return CONFIG_FILES.find(filename => fs.existsSync(path.join(directory, filename)));
}

function readConfigFile(configFile) {
    const file = fs.readFileSync(configFile, 'utf-8');
    try {
        return JSON.parse(file);
    } catch (err) {
        throw new Error('Malformed config');
    }
}

function readPackageJson(configFile) {
    const file = readConfigFile(configFile);
    if (file.metadataDiff) {
        return file.metadataDiff;
    }
    throw new Error('Configuration not found');
}

function getConfigEnvironment(config) {
    if (config.environment) {
        const { environment, ...defaultConfig } = config;
        const env = process.env.NODE_ENV || 'development';
        if (environment[env]) {
            return merge(defaultConfig, environment[env]);
        }
        return defaultConfig;
    }
    return config;
}

module.exports = getConfig;
