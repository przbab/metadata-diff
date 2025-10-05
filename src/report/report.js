import { getHtml, getScripts, getStyles } from './files.js';
import * as esbuild from 'esbuild';

export async function report(config, diffs) {
    const data = {
        candidateBaseUrl: config.candidateBaseUrl,
        currentBaseUrl: config.currentBaseUrl,
        date: new Date(),
        diffs,
    };

    await esbuild.build({
        bundle: true,
        entryPoints: ['./src/page/scripts.js', './src/page/styles.css'],
        outdir: 'dist',
    });

    const scripts = await getScripts(config);
    const styles = await getStyles(config);
    const html = await getHtml(data, scripts, styles, config);

    return html;
}
