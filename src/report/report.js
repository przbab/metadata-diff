import * as esbuild from 'esbuild';
import { getHtml, getScripts, getStyles } from './files.js';

export async function report(config, diffs) {
    const data = {
        candidateBaseUrl: config.candidateBaseUrl,
        currentBaseUrl: config.currentBaseUrl,
        date: new Date(),
        diffs,
    };

    await esbuild.build({
        bundle: true,
        entryPoints: [
            './src/page/scripts.js',
            './src/page/styles.css',
            './src/page/worker.js',
            { in: 'jsondiffpatch/formatters/styles/html.css', out: 'jsondiffpatch' },
        ],
        outdir: config.outputDir,
    });

    const { script, worker } = await getScripts(config);
    const styles = await getStyles(config);
    const html = await getHtml({ config, data, script, styles, worker });

    return html;
}
