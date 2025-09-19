'use strict';

const { getHtml, getScripts, getStyles } = require('./files');
const { processDiff, remapDiffs } = require('./processDiff');

async function report(config, diffs) {
    const remappedDiffs = remapDiffs(diffs);
    const data = {
        candidateBaseUrl: config.candidateBaseUrl,
        currentBaseUrl: config.currentBaseUrl,
        date: new Date(),
        diffs: remappedDiffs.map((diff) => ({
            candidate: processDiff(diff.candidate),
            client: processDiff(diff.client),
            note: diff.note,
            pathname: diff.pathname,
            server: processDiff(diff.server),
        })),
    };

    const scripts = await getScripts(config);
    const styles = await getStyles(config);
    const html = await getHtml(data, scripts, styles, config);

    return html;
}

module.exports = { report };
