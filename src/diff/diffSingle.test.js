import { diffSingle, parseData, transformData } from './diffSingle.js';
import { describe, mock, test } from 'node:test';

mock.module('../client/index.js', {
    namedExports: {
        fetchPathname: async (pathname) => {
            const mockData = (type) => ({
                html: pathname,
                redirects: [
                    {
                        status: 302,
                        target: 'http://example.com',
                        url: `http://example.com/${type}`,
                    },
                ],
            });
            return {
                candidateClientData: mockData('candidateClient'),
                candidateServerData: mockData('candidateServer'),
                currentClientData: mockData('currentClient'),
                currentServerData: mockData('currentServer'),
            };
        },
    },
});

mock.module('../parser.js', {
    namedExports: {
        parse: async (...params) => params,
    },
});

describe('diff', () => {
    describe('diffSingle', () => {
        test(`should diff single pathname`, async (t) => {
            const diff = await diffSingle('/', {}, {});

            t.assert.snapshot(diff);
        });
    });
    describe('parseData', () => {
        test(`should parse data in correct order`, async (t) => {
            const parsedData = await parseData(
                {
                    candidateClientData: { html: 'candidateClient' },
                    candidateServerData: { html: 'candidateServer' },
                    currentClientData: { html: 'currentClient' },
                    currentServerData: { html: 'currentServer' },
                },
                {}
            );

            t.assert.snapshot(parsedData);
        });
    });
    describe('transformData', () => {
        test(`should transform redirects`, (t) => {
            const parsedData = {
                jsonLd: {},
                metadata: {},
                microdata: {},
            };
            const rawData = {
                html: '',
                redirects: [{ status: 301, target: 'http://example.com/test', url: 'http://example.com' }],
            };

            const transformedData = transformData(parsedData, rawData, {
                replaceBaseUrls: false,
            });

            t.assert.snapshot(transformedData);
        });
    });
});
