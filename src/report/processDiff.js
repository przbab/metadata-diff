'use strict';

const jsondiffpatch = require('jsondiffpatch');

const jsondiff = jsondiffpatch.create({});

function transformData(data, delta) {
    return {
        all: Object.keys(data).length,
        delta,
        differences: Object.keys(delta).length,
        left: data,
    };
}
function transformPropertyFactory(context) {
    function transformProperty(property) {
        if (property !== null && typeof property === 'object') {
            return {
                '@type': property.type ? property.type[0].replace(context, '') : 'Unspecified Type',
                ...Object.keys(property.properties).reduce(
                    (acc, key) => ({ ...acc, [key]: extractProperties(property.properties[key]) }),
                    {}
                ),
            };
        }
        return property;
    }

    function extractProperties(properties) {
        if (properties.length > 1) {
            return properties.map((property) => transformProperty(property));
        }
        if (properties.length === 1) {
            return transformProperty(properties[0]);
        }
        return undefined;
    }

    return transformProperty;
}

function microdataToJsonLd(microdata) {
    const jsonLd = microdata.items.map((item) => {
        const context = 'http://schema.org/';
        const transformProperty = transformPropertyFactory(context);

        return {
            '@context': context,
            ...transformProperty(item),
        };
    });

    if (jsonLd.length === 1) {
        return jsonLd[0];
    }
    return jsonLd;
}

function processDiff(data) {
    const leftTransformedMicrodata = microdataToJsonLd(data.left.microdata);
    const rightTransformedMicrodata = microdataToJsonLd(data.right.microdata);

    const microdataDelta = jsondiff.diff(leftTransformedMicrodata, rightTransformedMicrodata) || {};
    const jsonLdDelta = jsondiff.diff(data.left.jsonLd, data.right.jsonLd) || {};
    const metadataDelta = jsondiff.diff(data.left.metadata, data.right.metadata) || {};
    const redirectsDelta = jsondiff.diff(data.left.redirects, data.right.redirects) || {};

    return {
        jsonLd: transformData(data.left.jsonLd, jsonLdDelta),
        metadata: transformData(data.left.metadata, metadataDelta),
        microdata: transformData(leftTransformedMicrodata, microdataDelta),
        redirects: transformData(data.left.redirects, redirectsDelta),
    };
}

function remapDiffs(diffs) {
    return diffs.map((diff) => ({
        ...diff,
        candidate: {
            left: diff.candidate.server,
            right: diff.candidate.client,
        },
        client: {
            left: diff.client.current,
            right: diff.client.candidate,
        },
        server: {
            left: diff.server.current,
            right: diff.server.candidate,
        },
    }));
}

module.exports = {
    microdataToJsonLd,
    processDiff,
    remapDiffs,
    transformData,
};
