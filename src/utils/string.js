'use strict';

const { curry } = require('./functional');

const striptUrl = (url) => url.replace(/https?:\/\/|www\./gi, '');

const getBaseUrlRegExp = (config) =>
    new RegExp(`(https?://)?(www.)?(${striptUrl(config.candidateBaseUrl)}|${striptUrl(config.currentBaseUrl)})`, 'ig');

const processReplacements = curry((config, string) => {
    let output = string;

    if (config.replaceBaseUrls) {
        const baseUrlRegExp = getBaseUrlRegExp(config);
        if (baseUrlRegExp.test(output)) {
            output = output.replaceAll(baseUrlRegExp, 'base-url');
        }
    }

    if (config.replacements && config.replacements.length > 0) {
        config.replacements.forEach((replacement) => {
            output = output.replace(new RegExp(replacement.regExp, replacement.flags), replacement.replace);
        });
    }

    return output;
});

module.exports = { striptUrl, getBaseUrlRegExp, processReplacements };
