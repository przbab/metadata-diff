'use strict';

const fs = require('fs');
const { promisify } = require('util');

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

function formatDate(date) {
    const d = new Date(date);
    return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()} ${d.getHours()}:${d.getMinutes()}`;
}

function fillHtml(html, { data, scripts, styles, pathnames }, config) {
    return html
        .replace(/{styles}/, styles)
        .replace(/{pathnames}/, pathnames)
        .replace(/{scripts}/, scripts)
        .replace(/{data}/, JSON.stringify(data))
        .replace(/{date}/, formatDate(data.date))
        .replace(/{currentUrl}/, config.currentBaseUrl)
        .replace(/{candidateUrl}/, data.candidateBaseUrl);
}

async function getHtml(data, scripts, styles, config) {
    const html = await readFile(config.html, 'utf8');
    const filledHtml = fillHtml(html, { data, scripts, styles, pathnames: renderDiffList(data) }, config);
    if (config.minify) {
        const minifyHtml = require('html-minifier').minify;
        return minifyHtml(filledHtml, {
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
    return filledHtml;
}

async function generateReport(data, config) {
    const scripts = await getScripts(config);
    const styles = await getStyles(config);
    const html = await getHtml(data, scripts, styles, config);

    return html;
}

function renderDiffList(data) {
    return data.diffs
        .map(diff => {
            const { all, differences } = ['candidate', 'client', 'server'].reduce(
                (acc, type) => {
                    const internalCount = ['metadata', 'microdata', 'redirects'].reduce(
                        (acc2, dataType) => ({
                            all: acc2.all + diff[type][dataType].all,
                            differences: acc2.differences + diff[type][dataType].differences,
                        }),
                        { all: 0, differences: 0 }
                    );
                    return {
                        all: acc.all + internalCount.all,
                        differences: acc.differences + internalCount.differences,
                    };
                },
                { all: 0, differences: 0 }
            );

            return `<li class="site-list-item" onclick="showSite(event)" name="${diff.pathname}">${
                diff.pathname
            } ${Math.round(100 * (differences / all))}%</li>`;
        })
        .join('');
}

module.exports = generateReport;
