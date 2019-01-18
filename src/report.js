'use strict';

const fs = require('fs');
const { promisify } = require('util');
const path = require('path');
const jsondiffpatch = require('jsondiffpatch');
const ejs = require('ejs');

const jsondiff = jsondiffpatch.create({});
const readFile = promisify(fs.readFile);
const renderFile = promisify(ejs.renderFile);

async function getScripts(config) {
    const file = config.scripts || path.join(__dirname, './page/scripts.js');
    const scripts = await readFile(file, 'utf8');
    if (config.minify) {
        const uglifyJs = require('uglify-es');
        return uglifyJs.minify(scripts).code;
    }
    return scripts;
}

async function getStyles(config) {
    const file = config.styles || path.join(__dirname, './page/styles.css');
    const styles = await readFile(file, 'utf8');
    if (config.minify) {
        const cssnano = require('cssnano');
        return (await cssnano.process(styles, { from: undefined })).css;
    }
    return styles;
}

async function getHtml(data, scripts, styles, config) {
    const file = config.html || path.join(__dirname, './page/index.ejs');
    const html = await renderFile(file, { config, data, scripts, styles });

    if (config.minify) {
        const minifyHtml = require('html-minifier').minify;
        return minifyHtml(html, {
            collapseBooleanAttributes: true,
            collapseWhitespace: true,
            minifyCSS: true,
            minifyJS: true,
            removeComments: true,
            removeCommentsFromCDATA: true,
            removeEmptyAttributes: true,
            removeRedundantAttributes: true,
        });
    }
    return html;
}

async function generateReport(data, config) {
    const scripts = await getScripts(config);
    const styles = await getStyles(config);
    const html = await getHtml(data, scripts, styles, config);

    return html;
}

async function report(config, diffs) {
    return generateReport(
        {
            date: new Date(),
            diffs: diffs.map(pathname => ({
                pathname: pathname.pathname,
                candidate: processCandidateDiff(pathname.candidate),
                client: processDiff(pathname.client),
                server: processDiff(pathname.server),
            })),
            currentBaseUrl: config.currentBaseUrl,
            candidateBaseUrl: config.candidateBaseUrl,
        },
        config
    );
}

function processDiff(data) {
    const [leftMatchedMicrodata, rightMatchedMicrodata] = matchMicrodataItems(
        data.current.microdata,
        data.candidate.microdata
    );
    const metadataDelta = jsondiff.diff(data.current.metadata, data.candidate.metadata) || {};
    const microdataDelta = jsondiff.diff(leftMatchedMicrodata, rightMatchedMicrodata) || {};
    const redirectsDelta = jsondiff.diff(data.current.redirects, data.candidate.redirects) || {};
    return {
        metadata: {
            all: Object.keys(data.current.metadata).length,
            delta: metadataDelta,
            differences: Object.keys(metadataDelta).length,
            left: data.current.metadata,
        },
        microdata: {
            all: Object.keys(data.current.microdata).length,
            delta: microdataDelta,
            differences: Object.keys(microdataDelta).length,
            left: data.current.microdata,
        },
        redirects: {
            all: Object.keys(data.current.redirects).length,
            delta: redirectsDelta,
            differences: Object.keys(redirectsDelta).length,
            left: data.current.redirects,
        },
    };
}

function processCandidateDiff(data) {
    const [leftMatchedMicrodata, rightMatchedMicrodata] = matchMicrodataItems(
        data.server.microdata,
        data.client.microdata
    );
    const metadataDelta = jsondiff.diff(data.server.metadata, data.client.metadata) || {};
    const microdataDelta = jsondiff.diff(leftMatchedMicrodata, rightMatchedMicrodata) || {};
    const redirectsDelta = jsondiff.diff(data.server.redirects, data.client.redirects) || {};
    return {
        metadata: {
            all: Object.keys(data.server.metadata).length,
            delta: metadataDelta,
            differences: Object.keys(metadataDelta).length,
            left: data.server.metadata,
        },
        microdata: {
            all: Object.keys(leftMatchedMicrodata).length,
            delta: microdataDelta,
            differences: Object.keys(microdataDelta).length,
            left: data.server.microdata,
        },
        redirects: {
            all: Object.keys(data.server.redirects).length,
            delta: redirectsDelta,
            differences: Object.keys(redirectsDelta).length,
            left: data.server.redirects,
        },
    };
}

function matchMicrodataItems(leftMicrodata, rightMicrodata) {
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

module.exports = report;
