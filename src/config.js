'use strict';

const fs = require('fs');
const path = require('path');
const merge = require('deepmerge');
const Joi = require('joi');
const schema = require('./schema');

const CONFIG_FILES = ['.metadatadiffrc', '.metadatadiffrc.json', '.metadatadiffrc.js', 'package.json'];

function getConfig(overrideConfig, skipConfig = false, file) {
    if (skipConfig) {
        return validateConfig(overrideConfig);
    }

    const directory = './';
    const configFile = file || getFilenameForDirectory(directory);
    if (!configFile) {
        throw new Error('Configuration not found');
    }
    const fullConfig = readFile(path.join(directory, configFile));
    const config = getConfigEnvironment(fullConfig, overrideConfig);
    return validateConfig(config);
}

function readFile(configFile) {
    if (configFile.match(/\.js$/)) {
        return readJsFile(configFile);
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

function readJsFile(configFile) {
    // eslint-disable-next-line import/no-dynamic-require
    return require(path.join('../', configFile));
}

function readPackageJson(configFile) {
    const file = readConfigFile(configFile);
    if (file.metadataDiff) {
        return file.metadataDiff;
    }
    throw new Error('Configuration not found');
}

function getConfigEnvironment(config, overrideConfig = {}) {
    if (config.environment) {
        const { environment, ...defaultConfig } = config;
        const env = process.env.METADATA_DIFF_ENV || process.env.NODE_ENV || 'development';
        if (environment[env]) {
            console.log('\n\n', overrideConfig, '\n\n');

            return merge.all([defaultConfig, environment[env], overrideConfig]);
        }
        return defaultConfig;
    }
    return config;
}

function validateConfig(config) {
    const { error, value } = Joi.validate(config, schema);
    if (error) {
        throw error;
    }

    return value;
}

module.exports = getConfig;
