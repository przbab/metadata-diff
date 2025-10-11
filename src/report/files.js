import fsPromises from 'fs/promises';
import { promisify } from 'util';
import path from 'path';
import ejs from 'ejs';
import { getLogger } from '../logger.js';

const renderFile = promisify(ejs.renderFile);

export async function getScripts(config) {
    const logger = getLogger();
    const scriptFile = path.resolve(process.cwd(), './dist/scripts.js');
    const workerFile = path.resolve(process.cwd(), './dist/worker.js');
    let script = await fsPromises.readFile(scriptFile, 'utf8');
    let worker = await fsPromises.readFile(workerFile, 'utf8');

    if (config.minify) {
        const { minify } = await import('terser');
        const scriptMinificationResult = await minify(script);
        const workerMinificationResult = await minify(worker);

        if (scriptMinificationResult.error) {
            logger.error('Scripts minification failed');
            logger.error(scriptMinificationResult.error);
        } else {
            script = scriptMinificationResult.code;
        }

        if (workerMinificationResult.error) {
            logger.error('Worker script minification failed');
            logger.error(workerMinificationResult.error);
        } else {
            worker = workerMinificationResult.code;
        }
    }

    return { script, worker };
}

export async function getStyles(config) {
    const file = path.resolve(process.cwd(), './src/page/styles.css');
    const styles = await fsPromises.readFile(file, 'utf8');
    if (config.minify) {
        const cssnano = (await import('cssnano')).default;
        return (await cssnano({ preset: 'default' }).process(styles, { from: undefined })).css;
    }
    return styles;
}

export async function getHtml({ config, data, script, styles, worker }) {
    const file = path.resolve(process.cwd(), './src/page/index.ejs');
    const html = await renderFile(file, { config, data, script, styles, worker });

    if (config.minify) {
        const minifyHtml = (await import('html-minifier')).minify;
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
