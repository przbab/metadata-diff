'use strict';

const fs = require('fs');
const { promisify } = require('util');

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

async function getScripts(config) {
    const scripts = await readFile(config.scripts, 'utf8');
    if (config.minify) {
        const uglifyJs = require('uglify-es');
        return uglifyJs.minify(scripts).code;
    }
    return scripts;
}

async function getStyles(config) {
    const styles = await readFile(config.styles, 'utf8');
    if (config.minify) {
        const cssnano = require('cssnano');
        return (await cssnano.process(styles)).css;
    }
    return styles;
}

function getHtml(data, scripts, styles, config) {
    const html = template(data, scripts, styles); // TODO move to template
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
    const html = getHtml(data, scripts, styles, config);

    if (config.output) {
        try {
            await writeFile(config.output, html);
        } catch (err) {
            console.error(err);
            process.exit(1);
        }
    }

    return html;
}

function renderSiteList(data) {
    return data.diffs
        .map(site => `<li class="site-list-item" onclick="showSite(event)">${site.pathname}</li>`)
        .join('');
}

function template(data, scripts, styles) {
    return `<!DOCTYPE html>
    <html>
        <head>
            <meta charset="utf-8" />
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <title>Metadata diff</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/jsondiffpatch@0.3.11/dist/formatters-styles/html.css" type="text/css" />
            <style>
                ${styles}
            </style>
        </head>
        <body>
            <div class="root">
                <div>
                    <ul class="environments">
                        <li id="server" class="environment" onclick="changeSource(event)">Current server => Candidate server</li>
                        <li id="client" class="environment" onclick="changeSource(event)">Current client => Candidate client</li>
                        <li id="candidate" class="environment" onclick="changeSource(event)">Candidate server => Candidate client</li>
                    </ul>
                </div>
                <div id="data">
                    <div class="site-list-container">
                        <ul class="site-list">
                            ${renderSiteList(data)}
                        </ul>
                    </div>
                    <div id="diffs">     
                        <h2>Metadata</h2>
                        <div class="autoscroll" id="metadata-diff">
                        </div>
                        <h2>Microdata</h2>
                        <div class="autoscroll" id="microdata-diff">
                        </div>
                    </div>
                </div>
            </div>
            <script type='text/javascript' src="https://cdn.jsdelivr.net/npm/jsondiffpatch/dist/jsondiffpatch.umd.min.js"></script>
            <script>${scripts}</script>
            <script>window.data=${JSON.stringify(data)}</script>
        </body>
    </html>`;
}

module.exports = generateReport;
