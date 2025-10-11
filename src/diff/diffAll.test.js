import { diffAll } from './diffAll.js';
import { describe, mock, test } from 'node:test';

mock.module('./diffSingle.js', {
    namedExports: {
        diffSingle: async (path) => ({ path }),
    },
});

describe('diff', () => {
    describe('diffAll', () => {
        test(`should diff all of the pathnames`, async (t) => {
            const config = {
                concurrency: 1,
                pathnames: ['/test1', { path: '/test2' }],
            };
            const diffs = await diffAll(config);

            t.assert.deepEqual(diffs, [{ path: '/test1' }, { path: '/test2' }]);
        });

        test(`should pass notes`, async (t) => {
            const config = {
                concurrency: 1,
                pathnames: [{ note: 'test note', path: '/test' }],
            };
            const diffs = await diffAll(config);

            t.assert.deepEqual(diffs, [{ note: 'test note', path: '/test' }]);
        });
    });
});
