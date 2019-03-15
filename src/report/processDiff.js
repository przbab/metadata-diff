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

function processDiff(data) {
    const [leftMatchedMicrodata, rightMatchedMicrodata] = matchItems(data.left.microdata, data.right.microdata);
    const microdataDelta = jsondiff.diff(leftMatchedMicrodata, rightMatchedMicrodata) || {};

    const [leftMatchedJsonLd, rightMatchedJsonLd] = matchItems(data.left.jsonLd, data.right.jsonLd);
    const jsonLdDelta = jsondiff.diff(leftMatchedJsonLd, rightMatchedJsonLd) || {};

    const metadataDelta = jsondiff.diff(data.left.metadata, data.right.metadata) || {};
    const redirectsDelta = jsondiff.diff(data.left.redirects, data.right.redirects) || {};

    return {
        metadata: transformData(data.left.metadata, metadataDelta),
        microdata: transformData(data.left.microdata, microdataDelta),
        jsonLd: transformData(data.left.jsonLd, jsonLdDelta),
        redirects: transformData(data.left.redirects, redirectsDelta),
    };
}

function matchItems(leftMicrodata, rightMicrodata) {
    const left = {};
    const right = {};
    leftMicrodata.items.forEach(item => {
        const type = (item.type && item.type[0]) || 'Unspecified Type';
        if (!left[type]) {
            left[type] = [];
        }
        left[type].push(item.properties);
    });
    rightMicrodata.items.forEach(item => {
        const type = (item.type && item.type[0]) || 'Unspecified Type';
        if (!right[type]) {
            right[type] = [];
        }
        right[type].push(item.properties);
    });

    return [left, right];
}

function remapDiffs(diffs) {
    return diffs.map(diff => ({
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
    matchItems,
    processDiff,
    remapDiffs,
    transformData,
};
