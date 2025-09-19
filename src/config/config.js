'use strict';

const fs = require('fs');
const path = require('path');
const merge = require('deepmerge');
const Joi = require('joi');
const { schema } = require('./schema');

const CONFIG_FILES = ['.metadatadiffrc', '.metadatadiffrc.json', '.metadatadiffrc.js', 'package.json'];

function getConfig(overrideConfig, skipConfig = false, file) {
    if (skipConfig) {
        return validateConfig(overrideConfig);
    }

    const directory = process.cwd();
    const configFile = file || getConfigFileForDirectory(directory);
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
        return readJSONConfigFile(configFile);
    }
    throw new Error('Unsupported configuration file type');
}

function getConfigFileForDirectory(directory) {
    return CONFIG_FILES.find((filename) => fs.existsSync(path.join(directory, filename)));
}

function readJSONConfigFile(configFile) {
    const file = fs.readFileSync(configFile, 'utf-8');
    try {
        return JSON.parse(file);
    } catch (err) {
        throw new Error('Malformed config');
    }
}

function readJsFile(configFile) {
    // eslint-disable-next-line import/no-dynamic-require
    return require(configFile);
}

function readPackageJson(configFile) {
    const file = readJSONConfigFile(configFile);
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
            return merge.all([defaultConfig, environment[env], overrideConfig]);
        }
        return defaultConfig;
    }
    return merge(config, overrideConfig);
}

function validateConfig(config) {
    const { error, value } = Joi.validate(config, schema);
    if (error) {
        throw error;
    }

    return value;
}

module.exports = {
    getConfig,
    getConfigEnvironment,
    readJSONConfigFile,
    readFile,
    readPackageJson,
    validateConfig,
};
