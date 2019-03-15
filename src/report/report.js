'use strict';

const { getScripts, getHtml, getStyles } = require('./files');
const { processDiff, remapDiffs } = require('./processDiff');

async function report(config, diffs) {
    const remappedDiffs = remapDiffs(diffs);
    const data = {
        date: new Date(),
        diffs: remappedDiffs.map(pathname => ({
            pathname: pathname.pathname,
            candidate: processDiff(pathname.candidate),
            client: processDiff(pathname.client),
            server: processDiff(pathname.server),
        })),
        currentBaseUrl: config.currentBaseUrl,
        candidateBaseUrl: config.candidateBaseUrl,
    };

    const scripts = await getScripts(config);
    const styles = await getStyles(config);
    const html = await getHtml(data, scripts, styles, config);

    return html;
}

module.exports = { report };
