'use strict';

const { transformData, remapDiffs } = require('./processDiff');

describe('report', () => {
    describe('processDiff', () => {
        describe('transformData', () => {
            test(`transform data`, () => {
                const data = {
                    title: 'test title',
                    description: 'test description',
                };
                const delta = {
                    title: 'changed title',
                };
                const transformedData = transformData(data, delta);

                expect(transformedData.all).toBe(Object.keys(data).length);
                expect(transformedData.differences).toBe(Object.keys(delta).length);
                expect(transformedData).toMatchSnapshot();
            });
        });
        describe('matchItems', () => {
            test.todo(`should match items`);
        });
        describe('remapDiffs', () => {
            test(`should remap diffs`, () => {
                const diffs = [
                    {
                        pathname: '/',
                        candidate: {
                            client: {
                                metadata: { title: 'test candidate client title' },
                            },
                            server: {
                                metadata: { title: 'test candidate server title' },
                            },
                        },
                        client: {
                            candidate: {
                                metadata: { title: 'test client candidate title' },
                            },
                            current: {
                                metadata: { title: 'test client current title' },
                            },
                        },
                        server: {
                            candidate: {
                                metadata: { title: 'test server candidate title' },
                            },
                            current: {
                                metadata: { title: 'test server current title' },
                            },
                        },
                    },
                ];

                const remappedDiffs = remapDiffs(diffs);

                expect(remappedDiffs).toMatchSnapshot();
            });
        });
        describe('processDiff', () => {
            test.todo(`should process diff`);
            test.todo(`should provide default values for deltas`);
        });
    });
});
