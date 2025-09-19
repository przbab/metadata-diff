import { microdataToJsonLd, processDiff, remapDiffs, transformData } from './processDiff.js';
import { describe, test } from 'node:test';

describe('report', () => {
    describe('processDiff', () => {
        describe('transformData', () => {
            test(`transform data`, (t) => {
                const data = {
                    description: 'test description',
                    title: 'test title',
                };
                const delta = {
                    title: 'changed title',
                };
                const transformedData = transformData(data, delta);
                t.assert.deepEqual(transformedData.all, Object.keys(data).length);
                t.assert.deepEqual(transformedData.differences, Object.keys(delta).length);
                t.assert.snapshot(transformedData);
            });
        });
        describe('remapDiffs', () => {
            test(`should remap diffs`, (t) => {
                const diffs = [
                    {
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
                        pathname: '/',
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
                t.assert.snapshot(remappedDiffs);
            });
        });
        describe('processDiff', () => {
            test(`should process diff`, (t) => {
                const diff = processDiff({
                    left: {
                        jsonLd: {
                            '@context': 'http://schema.org',
                            '@type': 'Organization',
                            contactPoint: [
                                {
                                    '@type': 'ContactPoint',
                                    contactType: 'customer service',
                                    telephone: '+1-401-555-1212',
                                },
                            ],
                            url: 'http://example.com',
                        },
                        metadata: {
                            cannonical: 'http://example.com',
                            h1: ['header 1', 'header 2'],
                        },
                        microdata: {
                            items: [
                                {
                                    properties: {
                                        contactPoint: [
                                            {
                                                properties: {
                                                    contactType: ['customer service'],
                                                    telephone: ['+1-401-555-1212'],
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
                        redirects: [{ status: 301, target: 'http://example.com', url: 'http://example.com/test' }],
                    },
                    right: {
                        jsonLd: {
                            '@context': 'http://schema.org',
                            '@type': 'Organization',
                            contactPoint: [{ '@type': 'ContactPoint', contactType: 'customer service' }],
                        },
                        metadata: {
                            cannonical: 'http://example.com/test',
                            h1: ['header 1'],
                        },
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
                        redirects: [],
                    },
                });
                t.assert.snapshot(diff);
            });
            test(`should provide default values for deltas`, (t) => {
                const emptyData = {
                    jsonLd: [],
                    metadata: [],
                    microdata: { items: [] },
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
                t.assert.deepEqual(diff.metadata, emptyResult);
                t.assert.deepEqual(diff.microdata, emptyResult);
                t.assert.deepEqual(diff.jsonLd, emptyResult);
                t.assert.deepEqual(diff.redirects, emptyResult);
            });
        });
        describe('microdataToJsonLd', () => {
            test('should convert microdata to JSON-LD', (t) => {
                t.assert.deepEqual(
                    microdataToJsonLd({
                        items: [
                            {
                                properties: {
                                    contactPoint: [
                                        {
                                            properties: {
                                                availableLanguage: ['en', 'nb'],
                                                contactType: ['customer service'],
                                                productSupported: ['base-url'],
                                            },
                                            type: ['http://schema.org/ContactPoint'],
                                        },
                                    ],
                                    employee: [
                                        {
                                            properties: {
                                                jobTitle: ['Job title 1'],
                                                name: ['Employee1'],
                                            },
                                            type: ['http://schema.org/Person'],
                                        },
                                        {
                                            properties: {
                                                jobTitle: ['Job title 2'],
                                                name: ['Employee2'],
                                            },
                                            type: ['http://schema.org/Person'],
                                        },
                                    ],
                                    name: ['Test name'],
                                    sameAs: ['https://instagram.com/test', 'https://www.facebook.com/test'],
                                    url: ['base-url'],
                                },
                                type: ['http://schema.org/Organization'],
                            },
                        ],
                    }),
                    {
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
                    }
                );
            });
        });
    });
});
