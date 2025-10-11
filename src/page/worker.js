import { diff } from 'jsondiffpatch';

// eslint-disable-next-line no-restricted-globals
self.onmessage = (event) => {
    const { data, path, type } = event.data;

    const [sourceString, targetString] = type.split('-');
    const [sourceEnv, sourceType] = sourceString.split('.');
    const [targetEnv, targetType] = targetString.split('.');

    const sourceData = data[sourceEnv][sourceType];
    const targetData = data[targetEnv][targetType];

    const redirectsDelta = diff(sourceData.redirects, targetData.redirects);
    const jsonLdDelta = diff(sourceData.jsonLd, targetData.jsonLd);
    const metadataDelta = diff(sourceData.metadata, targetData.metadata);
    const microdataDelta = diff(sourceData.microdata, targetData.microdata);

    postMessage({
        diff: {
            jsonLdDelta,
            metadataDelta,
            microdataDelta,
            redirectsDelta,
        },
        path,
        type,
    });
};
