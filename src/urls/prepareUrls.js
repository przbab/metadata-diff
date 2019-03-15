'use strict';

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

function getBaseUrlRegExp(config) {
    return new RegExp(
        `(https?://)?(www.)?(${striptUrl(config.currentBaseUrl)}|${striptUrl(config.candidateBaseUrl)})`,
        'ig'
    );
}

function striptUrl(url) {
    return url.replace(/https?:\/\/|www\./gi, '');
}

module.exports = {
    getBaseUrlRegExp,
    prepareUrls,
    striptUrl,
};
