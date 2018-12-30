'use strict';

function prepareUrls(string, config) {
    let output = string;
    if (config.replaceBaseUrls) {
        output = output.replace(getBaseUrlRegExp(config), 'base-url');
    }
    if (config.replacements && config.replacements.length > 0) {
        config.replacements.forEach(replacement => {
            output = output.replace(new RegExp(replacement.regExp, replacement.flags), replacement.replace);
        });
    }
    return output;
}

function getBaseUrlRegExp(config) {
    const urls = [config.currentBaseUrl, config.candidateBaseUrl];
    if (config.currentBaseUrl.match(/www/)) {
        urls.push(config.currentBaseUrl.replace(/www\./, ''));
    } else {
        urls.push(config.currentBaseUrl.replace(/(https?:\/\/)/, '$1www.'));
    }
    if (config.candidateBaseUrl.match(/www/)) {
        urls.push(config.candidateBaseUrl.replace(/www\./, ''));
    } else {
        urls.push(config.candidateBaseUrl.replace(/(https?:\/\/)/, '$1www.'));
    }
    return new RegExp(urls.join('|'), 'ig');
}

function prepareRedirects(redirects, config) {
    return redirects.map(redirect => ({
        ...redirect,
        target: prepareUrls(redirect.target, config),
        url: prepareUrls(redirect.url, config),
    }));
}

module.exports = { prepareUrls, prepareRedirects };
