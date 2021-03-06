'use strict';

const { transformData, remapDiffs, microdataToJsonLd, processDiff } = require('./processDiff');

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
            test(`should process diff`, () => {
                const diff = processDiff({
                    left: {
                        microdata: {
                            items: [
                                {
                                    properties: {
                                        contactPoint: [
                                            {
                                                properties: {
                                                    telephone: ['+1-401-555-1212'],
                                                    contactType: ['customer service'],
                                                },
                                                type: ['http://schema.org/ContactPoint'],
                                            },
                                        ],
                                        url: ['http://example.com'],
                                    },
                                    type: ['http://schema.org/Organization'],
                                },
                            ],
                        },
                        metadata: {
                            cannonical: 'http://example.com',
                            h1: ['header 1', 'header 2'],
                        },
                        jsonLd: {
                            '@context': 'http://schema.org',
                            '@type': 'Organization',
                            url: 'http://example.com',
                            contactPoint: [
                                {
                                    '@type': 'ContactPoint',
                                    telephone: '+1-401-555-1212',
                                    contactType: 'customer service',
                                },
                            ],
                        },
                        redirects: [{ status: 301, target: 'http://example.com', url: 'http://example.com/test' }],
                    },
                    right: {
                        microdata: {
                            items: [
                                {
                                    properties: {
                                        contactPoint: [
                                            {
                                                properties: {
                                                    contactType: ['customer service'],
                                                },
                                                type: ['http://schema.org/ContactPoint'],
                                            },
                                        ],
                                    },
                                    type: ['http://schema.org/Organization'],
                                },
                            ],
                        },
                        metadata: {
                            cannonical: 'http://example.com/test',
                            h1: ['header 1'],
                        },
                        jsonLd: {
                            '@context': 'http://schema.org',
                            '@type': 'Organization',
                            contactPoint: [{ '@type': 'ContactPoint', contactType: 'customer service' }],
                        },
                        redirects: [],
                    },
                });

                expect(diff).toMatchSnapshot();
            });
            test(`should provide default values for deltas`, () => {
                const emptyData = {
                    metadata: [],
                    microdata: { items: [] },
                    jsonLd: [],
                    redirects: [],
                };

                const emptyResult = {
                    all: 0,
                    delta: {},
                    differences: 0,
                    left: [],
                };

                const diff = processDiff({
                    left: emptyData,
                    right: emptyData,
                });

                expect(diff.metadata).toEqual(emptyResult);
                expect(diff.microdata).toEqual(emptyResult);
                expect(diff.jsonLd).toEqual(emptyResult);
                expect(diff.redirects).toEqual(emptyResult);
            });
        });
        describe('microdataToJsonLd', () => {
            test('should convert microdata to JSON-LD', () => {
                expect(
                    microdataToJsonLd({
                        items: [
                            {
                                properties: {
                                    employee: [
                                        {
                                            properties: {
                                                name: ['Employee1'],
                                                jobTitle: ['Job title 1'],
                                            },
                                            type: ['http://schema.org/Person'],
                                        },
                                        {
                                            properties: {
                                                name: ['Employee2'],
                                                jobTitle: ['Job title 2'],
                                            },
                                            type: ['http://schema.org/Person'],
                                        },
                                    ],
                                    sameAs: ['https://instagram.com/test', 'https://www.facebook.com/test'],
                                    name: ['Test name'],
                                    url: ['base-url'],
                                    contactPoint: [
                                        {
                                            properties: {
                                                contactType: ['customer service'],
                                                availableLanguage: ['en', 'nb'],
                                                productSupported: ['base-url'],
                                            },
                                            type: ['http://schema.org/ContactPoint'],
                                        },
                                    ],
                                },
                                type: ['http://schema.org/Organization'],
                            },
                        ],
                    })
                ).toEqual({
                    '@context': 'http://schema.org/',
                    '@type': 'Organization',
                    contactPoint: {
                        '@type': 'ContactPoint',
                        availableLanguage: ['en', 'nb'],
                        contactType: 'customer service',
                        productSupported: 'base-url',
                    },
                    employee: [
                        { '@type': 'Person', jobTitle: 'Job title 1', name: 'Employee1' },
                        { '@type': 'Person', jobTitle: 'Job title 2', name: 'Employee2' },
                    ],
                    name: 'Test name',
                    sameAs: ['https://instagram.com/test', 'https://www.facebook.com/test'],
                    url: 'base-url',
                });
            });
        });
    });
});
