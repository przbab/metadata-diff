'use strict';

const { getHtml, getScripts, getStyles } = require('./files');

describe('report', () => {
    describe('files', () => {
        describe('getScripts', () => {
            test(`should read default file`, async () => {
                const defaultResult = await getScripts({ minify: false });
                expect(defaultResult).toBeDefined();
                expect(typeof defaultResult).toEqual('string');
            });
            test(`should read user specified file`, async () => {
                const defaultResult = await getScripts({ minify: false });
                const result = await getScripts({ scripts: './test/mockConfigFiles/mockScripts.js', minify: false });
                expect(result).toBeDefined();
                expect(typeof result).toEqual('string');
                expect(result).not.toEqual(defaultResult);
            });
            test(`should minify file`, async () => {
                const minifiedResult = await getScripts({ minify: true });
                const defaultResult = await getScripts({ minify: false });
                expect(minifiedResult).toBeDefined();
                expect(typeof minifiedResult).toEqual('string');
                expect(minifiedResult.length).toBeLessThan(defaultResult.length);
            });
            test(`should throw error on bad read`, () =>
                getScripts({
                    scripts: './thisPathShouldNotExist',
                    minify: false,
                }).catch((e) => {
                    expect(e).toBeDefined();
                }));
        });
        describe('getStyles', () => {
            test(`should read default file`, async () => {
                const defaultResult = await getStyles({ minify: false });
                expect(defaultResult).toBeDefined();
                expect(typeof defaultResult).toEqual('string');
            });
            test(`should read user specified file`, async () => {
                const defaultResult = await getStyles({ minify: false });
                const result = await getStyles({ styles: './test/mockConfigFiles/mockStyles.css', minify: false });
                expect(result).toBeDefined();
                expect(typeof result).toEqual('string');
                expect(result).not.toEqual(defaultResult);
            });
            test(`should minify file`, async () => {
                const minifiedResult = await getStyles({ minify: true });
                const defaultResult = await getStyles({ minify: false });
                expect(minifiedResult).toBeDefined();
                expect(typeof minifiedResult).toEqual('string');
                expect(minifiedResult.length).toBeLessThan(defaultResult.length);
            });
            test(`should throw error on bad read`, () =>
                getStyles({
                    scripts: './thisPathShouldNotExist',
                    minify: false,
                }).catch((e) => {
                    expect(e).toBeDefined();
                }));
        });
        describe('getHtml', () => {
            test(`should read default file`, async () => {
                const defaultResult = await getHtml(
                    {
                        date: new Date(),
                        diffs: [],
                    },
                    '',
                    '',
                    { minify: false }
                );
                expect(defaultResult).toBeDefined();
                expect(typeof defaultResult).toEqual('string');
            });
            test(`should read user specified file`, async () => {
                const defaultResult = await getHtml(
                    {
                        date: new Date(),
                        diffs: [],
                    },
                    '',
                    '',
                    { minify: false }
                );
                const result = await getHtml(
                    {
                        date: new Date(),
                        diffs: [],
                    },
                    '',
                    '',
                    { html: './test/mockConfigFiles/mockHtml.html', minify: false }
                );
                expect(result).toBeDefined();
                expect(typeof result).toEqual('string');
                expect(result).not.toEqual(defaultResult);
            });
            test(`should minify file`, async () => {
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
                expect(minifiedResult).toBeDefined();
                expect(typeof minifiedResult).toEqual('string');
                expect(minifiedResult.length).toBeLessThan(defaultResult.length);
            });
            test(`should throw error on bad read`, () =>
                getHtml({
                    scripts: './thisPathShouldNotExist',
                    minify: false,
                }).catch((e) => {
                    expect(e).toBeDefined();
                }));
        });
    });
});
