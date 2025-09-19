'use strict';

const { diffSingle, parseData, transformData } = require('./diffSingle');

jest.mock('../client', () => ({
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
}));

jest.mock('../parser', () => ({
    parse: async (...params) => params,
}));

describe('diff', () => {
    describe('diffSingle', () => {
        test(`should diff single pathname`, async () => {
            const diff = await diffSingle('/', {}, {});

            expect(diff).toMatchSnapshot();
        });
    });
    describe('parseData', () => {
        test(`should parse data in correct order`, async () => {
            const parsedData = await parseData(
                {
                    candidateClientData: { html: 'candidateClient' },
                    candidateServerData: { html: 'candidateServer' },
                    currentClientData: { html: 'currentClient' },
                    currentServerData: { html: 'currentServer' },
                },
                {}
            );

            expect(parsedData).toMatchSnapshot();
        });
    });
    describe('transformData', () => {
        test(`should transform redirects`, () => {
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

            expect(transformedData).toMatchSnapshot();
        });
    });
});
