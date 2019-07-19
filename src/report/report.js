'use strict';

const { getScripts, getHtml, getStyles } = require('./files');
const { processDiff, remapDiffs } = require('./processDiff');

async function report(config, diffs) {
    const remappedDiffs = remapDiffs(diffs);
    const data = {
        date: new Date(),
        diffs: remappedDiffs.map(diff => ({
            pathname: diff.pathname,
            note: diff.note,
            candidate: processDiff(diff.candidate),
            client: processDiff(diff.client),
            server: processDiff(diff.server),
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
