import { getHtml, getScripts, getStyles } from './files.js';
import { describe, test } from 'node:test';

describe('report', () => {
    describe('files', () => {
        describe('getScripts', () => {
            test(`should read default file`, async (t) => {
                const defaultResult = await getScripts({ minify: false });
                t.assert.ok(defaultResult);
                t.assert.equal(typeof defaultResult, 'string');
            });
            test(`should minify file`, async (t) => {
                const minifiedResult = await getScripts({ minify: true });
                const defaultResult = await getScripts({ minify: false });
                t.assert.ok(minifiedResult);
                t.assert.equal(typeof minifiedResult, 'string');
                t.assert.ok(minifiedResult.length < defaultResult.length);
            });
            describe('getStyles', () => {
                test(`should read default file`, async (t) => {
                    const defaultResult = await getStyles({ minify: false });
                    t.assert.ok(defaultResult);
                    t.assert.equal(typeof defaultResult, 'string');
                });
                test(`should minify file`, async (t) => {
                    const minifiedResult = await getStyles({ minify: true });
                    const defaultResult = await getStyles({ minify: false });
                    t.assert.ok(minifiedResult);
                    t.assert.equal(typeof minifiedResult, 'string');
                    t.assert.ok(minifiedResult.length < defaultResult.length);
                });
            });
            describe('getHtml', () => {
                test(`should read default file`, async (t) => {
                    const defaultResult = await getHtml(
                        {
                            date: new Date(),
                            diffs: [],
                        },
                        '',
                        '',
                        { minify: false }
                    );
                    t.assert.ok(defaultResult);
                    t.assert.equal(typeof defaultResult, 'string');
                });
                test(`should minify file`, async (t) => {
                    const minifiedResult = await getHtml(
                        {
                            date: new Date(),
                            diffs: [],
                        },
                        '',
                        '',
                        { minify: true }
                    );
                    const defaultResult = await getHtml(
                        {
                            date: new Date(),
                            diffs: [],
                        },
                        '',
                        '',
                        { minify: false }
                    );
                    t.assert.ok(minifiedResult);
                    t.assert.equal(typeof minifiedResult, 'string');
                    t.assert.ok(minifiedResult.length < defaultResult.length);
                });
            });
        });
    });
});
