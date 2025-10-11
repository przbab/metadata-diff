import { getHtml, getScripts, getStyles } from './files.js';
import { describe, test } from 'node:test';

describe('report', () => {
    describe('files', () => {
        describe.skip('getScripts', () => {
            test(`should read default file`, async (t) => {
                const { script, worker } = await getScripts({ minify: false });
                t.assert.ok(script);
                t.assert.equal(typeof script, 'string');
                t.assert.ok(worker);
                t.assert.equal(typeof worker, 'string');
            });
            test(`should minify file`, async (t) => {
                const { script: minifiedScript, worker: minifiedWorker } = await getScripts({ minify: true });
                const { script: defaultScript, worker: defaultWorker } = await getScripts({ minify: false });
                t.assert.ok(minifiedScript);
                t.assert.equal(typeof minifiedScript, 'string');
                t.assert.ok(minifiedScript.length < defaultScript.length);
                t.assert.ok(minifiedWorker);
                t.assert.equal(typeof minifiedWorker, 'string');
                t.assert.ok(minifiedWorker.length < defaultWorker.length);
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
                    const defaultResult = await getHtml({
                        config: { minify: false },
                        data: {
                            date: new Date(),
                            diffs: [],
                        },
                        script: '',
                        styles: '',
                        worker: '',
                    });
                    t.assert.ok(defaultResult);
                    t.assert.equal(typeof defaultResult, 'string');
                });
                test(`should minify file`, async (t) => {
                    const minifiedResult = await getHtml({
                        config: { minify: true },
                        data: {
                            date: new Date(),
                            diffs: [],
                        },
                        script: '',
                        styles: '',
                        worker: '',
                    });
                    const defaultResult = await getHtml({
                        config: { minify: false },
                        data: {
                            date: new Date(),
                            diffs: [],
                        },
                        script: '',
                        styles: '',
                        worker: '',
                    });
                    t.assert.ok(minifiedResult);
                    t.assert.equal(typeof minifiedResult, 'string');
                    t.assert.ok(minifiedResult.length < defaultResult.length);
                });
            });
        });
    });
});
