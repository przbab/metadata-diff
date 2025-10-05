import fsPromises from 'fs/promises';
import { promisify } from 'util';
import path from 'path';
import ejs from 'ejs';
import { getLogger } from '../logger.js';

const renderFile = promisify(ejs.renderFile);

export async function getScripts(config) {
    const logger = getLogger();
    const file = path.resolve(process.cwd(), './dist/scripts.js');
    const scripts = await fsPromises.readFile(file, 'utf8');

    if (config.minify) {
        const { minify } = await import('terser');
        const result = await minify(scripts);

        if (result.error) {
            logger.error('Scripts minification failed');
            logger.error(result.error);

            return scripts;
        }

        return result.code;
    }
    return scripts;
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

export async function getHtml(data, scripts, styles, config) {
    const file = path.resolve(process.cwd(), './src/page/index.ejs');
    const html = await renderFile(file, { config, data, scripts, styles });

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
