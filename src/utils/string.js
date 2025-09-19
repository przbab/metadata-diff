import { curry } from './functional.js';

export const striptUrl = (url) => url.replace(/https?:\/\//gi, '').replace(/www\./gi, '');

export const getBaseUrlRegExp = (config) =>
    new RegExp(`(https?://)?(www.)?(${striptUrl(config.candidateBaseUrl)}|${striptUrl(config.currentBaseUrl)})`, 'ig');

export const processReplacements = curry((config, string) => {
    let output = string;

    if (config.replaceBaseUrls) {
        const baseUrlRegExp = getBaseUrlRegExp(config);
        if (baseUrlRegExp.test(output)) {
            output = output.replaceAll
                ? output.replaceAll(baseUrlRegExp, 'base-url')
                : output.replace(baseUrlRegExp, 'base-url');
        }
    }

    if (config.replacements && config.replacements.length > 0) {
        config.replacements.forEach((replacement) => {
            output = output.replace(new RegExp(replacement.regExp, replacement.flags), replacement.replace);
        });
    }

    return output;
});
