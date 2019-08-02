'use strict';

const fs = require('fs');
const { promisify } = require('util');
const path = require('path');
const ejs = require('ejs');
const { getLogger } = require('../logger');

const readFile = promisify(fs.readFile);
const renderFile = promisify(ejs.renderFile);

async function getScripts(config) {
    const logger = getLogger();
    const file = config.scripts || path.join(__dirname, '../page/scripts.js');
    const scripts = await readFile(file, 'utf8');

    if (config.minify) {
        const terser = require('terser');
        const result = terser.minify(scripts);

        if (result.error) {
            logger.error('Scripts minification failed');
            logger.error(result.error);

            return scripts;
        }

        return result.code;
    }
    return scripts;
}

async function getStyles(config) {
    const file = config.styles || path.join(__dirname, '../page/styles.css');
    const styles = await readFile(file, 'utf8');
    if (config.minify) {
        const cssnano = require('cssnano');
        return (await cssnano.process(styles, { from: undefined })).css;
    }
    return styles;
}

async function getHtml(data, scripts, styles, config) {
    const file = config.html || path.join(__dirname, '../page/index.ejs');
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

module.exports = {
    getHtml,
    getScripts,
    getStyles,
};
