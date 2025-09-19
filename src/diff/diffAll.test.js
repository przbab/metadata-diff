'use strict';

const { diffAll } = require('./diffAll');

jest.mock('./diffSingle', () => ({ diffSingle: async (pathname) => ({ pathname }) }));

describe('diff', () => {
    describe('diffAll', () => {
        test(`should diff all of the pathnames`, async () => {
            const config = {
                concurrency: 1,
                pathnames: ['/test1', { path: '/test2' }],
                userAgent: 'testUserAgent',
            };
            const diffs = await diffAll(config);

            expect(diffs).toEqual([
                { note: '', pathname: '/test1' },
                { note: '', pathname: '/test2' },
            ]);
        });

        test(`should pass notes`, async () => {
            const config = {
                concurrency: 1,
                pathnames: [{ note: 'test note', path: '/test' }],
                userAgent: 'testUserAgent',
            };
            const diffs = await diffAll(config);

            expect(diffs).toEqual([{ note: 'test note', pathname: '/test' }]);
        });
    });
});
