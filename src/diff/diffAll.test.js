'use strict';

const { diffAll } = require('./diffAll');

jest.mock('./diffSingle', () => ({ diffSingle: async pathname => ({ pathname }) }));

describe('diff', () => {
    describe('diffAll', () => {
        test(`should diff all of the pathnames`, async () => {
            const config = {
                pathnames: ['/test1', '/test2'],
                userAgent: 'testUserAgent',
                puppeteerOptions: {
                    additionalWait: 5000,
                },
            };
            const diffs = await diffAll(config);

            expect(diffs).toEqual([{ note: '', pathname: '/test1' }, { note: '', pathname: '/test2' }]);
        });
    });
});
