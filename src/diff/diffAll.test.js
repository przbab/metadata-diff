'use strict';

const { diffAll } = require('./diffAll');

jest.mock('./diffSingle', () => ({ diffSingle: async pathname => ({ pathname }) }));

describe('diff', () => {
    describe('diffAll', () => {
        test(`should diff all of the pathnames`, async () => {
            const config = {
                pathnames: ['/test1', { path: '/test2' }],
                userAgent: 'testUserAgent',
                concurrency: 1,
            };
            const diffs = await diffAll(config);

            expect(diffs).toEqual([{ note: '', pathname: '/test1' }, { note: '', pathname: '/test2' }]);
        });

        test(`should pass notes`, async () => {
            const config = {
                pathnames: [{ path: '/test', note: 'test note' }],
                userAgent: 'testUserAgent',
                concurrency: 1,
            };
            const diffs = await diffAll(config);

            expect(diffs).toEqual([{ note: 'test note', pathname: '/test' }]);
        });
    });
});
