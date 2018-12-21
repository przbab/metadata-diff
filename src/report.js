'use strict';

const fs = require('fs');
const { promisify } = require('util');
const minifyHtml = require('html-minifier').minify;
const uglifyJs = require('uglify-es');
const cssnano = require('cssnano');

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

async function generateReport(sites, fileName) {
    const scripts = await readFile('./src/page/scripts.js', 'utf8');
    const minifiedScripts = uglifyJs.minify(scripts).code;

    const styles = await readFile('./src/page/styles.css', 'utf8');
    const minifiedStyles = (await cssnano.process(styles)).css;

    const html = template(sites, minifiedScripts, minifiedStyles);
    const minifiedHtml = minifyHtml(html, {
        collapseBooleanAttributes: true,
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: true,
        removeComments: true,
        removeCommentsFromCDATA: true,
        removeEmptyAttributes: true,
        removeRedundantAttributes: true,
    });

    if (fileName) {
        try {
            await writeFile(fileName, minifiedHtml);
        } catch (err) {
            console.error(err);
            process.exit(1);
        }
    }

    return minifiedHtml;
}

function renderSiteList(sites) {
    return sites.map(site => `<li class="site-list-item" onclick="showSite(event)">${site.pathname}</li>`).join('');
}

function renderDiffs(sites) {
    return sites
        .map(
            site => `
        <div name="site-${site.pathname}" class="site-content">
            <h2>Metadata</h2>
            <div class="autoscroll">
                ${site.metadata}
            </div>
            <h2>Microdata</h2>
            <div class="autoscroll">
                ${site.microdata}
            </div>
        </div>
    `
        )
        .join('');
}

function template(sites, scripts, styles) {
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
                        <li id="server-server" class="environment" onclick="changeSource(event)">Current server => Candidate server</li>
                        <li id="client-client" class="environment" onclick="changeSource(event)">Current client => Candidate client</li>
                        <li id="server-client" class="environment" onclick="changeSource(event)">Candidate server => Candidate client</li>
                    </ul>
                </div>
                <div id="data">
                    <div class="site-list-container">
                        <ul class="site-list">
                            ${renderSiteList(sites)}
                        </ul>
                    </div>
                    <div id="server-server-content" class="environment-content">
                        ${renderDiffs(sites.map(site => Object.assign({}, site.server, { pathname: site.pathname })))}
                    </div>
                    <div id="client-client-content" class="environment-content">
                        ${renderDiffs(sites.map(site => Object.assign({}, site.client, { pathname: site.pathname })))}
                    </div>
                    <div id="server-client-content" class="environment-content">
                        ${renderDiffs(
                            sites.map(site => Object.assign({}, site.candidate, { pathname: site.pathname }))
                        )}
                    </div>
                </div>
            </div>
            <script>
                ${scripts}
            </script>
        </body>
    </html>`;
}

module.exports = generateReport;
