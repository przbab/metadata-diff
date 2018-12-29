'use strict';

const jsondiffpatch = require('jsondiffpatch');

const jsondiff = jsondiffpatch.create({});

function compareSites(current, candidate) {
    return {
        metadata: diffMetadata(current, candidate),
        microdata: diffMicrodata(current, candidate),
    };
}

function diffMetadata(currentMetadata, candidateMetadata) {
    const { microdata: currentMicrodata, ...currentReducedMetadata } = currentMetadata;
    const { microdata: candidateMicrodata, ...candidateReducedMetadata } = candidateMetadata;
    return diff(currentReducedMetadata, candidateReducedMetadata);
}

function diffMicrodata(currentMetadata, candidateMetadata) {
    const currentMicrodata = currentMetadata.microdata;
    const candidateMicrodata = candidateMetadata.microdata;

    const { current, candidate } = matchMicrodataItems(currentMicrodata, candidateMicrodata);

    return diff(current, candidate);
}

function diff(left, right) {
    const delta = jsondiff.diff(left, right);
    return jsondiffpatch.formatters.html.format(delta, left);
}

function matchMicrodataItems(currentMicrodata, candidateMicrodata) {
    const typeMap = { current: {}, candidate: {} };
    currentMicrodata.items.forEach(item => {
        const type = (item.type && item.type[0]) || 'Unspecified Type';
        if (!typeMap.current[type]) {
            typeMap.current[type] = [];
        }
        typeMap.current[type].push(item.properties);
    });
    candidateMicrodata.items.forEach(item => {
        const type = (item.type && item.type[0]) || 'Unspecified Type';
        if (!typeMap.candidate[type]) {
            typeMap.candidate[type] = [];
        }
        typeMap.candidate[type].push(item.properties);
    });

    return typeMap;
}

module.exports = compareSites;
