'use strict';

/**
 * Prepares url for diffing.
 *
 * @param {string} url
 * @param {object} config
 * @return {string} Prepared url
 */
function prepareUrls(url, config) {
    if (config.replaceBaseUrls) {
        const baseUrlRegExp = getBaseUrlRegExp(config);
        if (baseUrlRegExp.test(url)) {
            return url.replace(baseUrlRegExp, 'base-url');
        }
    }

    let output = url;
    if (config.replacements && config.replacements.length > 0) {
        config.replacements.forEach(replacement => {
            output = output.replace(new RegExp(replacement.regExp, replacement.flags), replacement.replace);
        });
    }
    return output;
}

/**
 * Creates regex matching variations of base urls
 *
 * @param {object} config
 * @return {object} Regular expression
 */
function getBaseUrlRegExp(config) {
    return new RegExp(
        `(https?://)?(www.)?(${striptUrl(config.currentBaseUrl)}|${striptUrl(config.candidateBaseUrl)})`,
        'ig'
    );
}

/**
 * Strips protocol and www from url
 *
 * @param {string} url
 * @return {string} Stripped url
 */
function striptUrl(url) {
    return url.replace(/https?:\/\/|www\./gi, '');
}

module.exports = prepareUrls;
