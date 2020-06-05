'use strict';

const { diffSingle, parseData, transformData } = require('./diffSingle');

jest.mock('../client', () => ({
    fetchPathname: async (pathname) => {
        const mockData = (type) => ({
            html: pathname,
            redirects: [
                {
                    status: 302,
                    url: `http://example.com/${type}`,
                    target: 'http://example.com',
                },
            ],
        });
        return {
            currentServerData: mockData('currentServer'),
            currentClientData: mockData('currentClient'),
            candidateServerData: mockData('candidateServer'),
            candidateClientData: mockData('candidateClient'),
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
                    currentServerData: { html: 'currentServer' },
                    currentClientData: { html: 'currentClient' },
                    candidateServerData: { html: 'candidateServer' },
                    candidateClientData: { html: 'candidateClient' },
                },
                {}
            );

            expect(parsedData).toMatchSnapshot();
        });
    });
    describe('transformData', () => {
        test(`should transform redirects`, () => {
            const parsedData = {
                metadata: {},
                microdata: {},
                jsonLd: {},
            };
            const rawData = {
                html: '',
                redirects: [{ status: 301, url: 'http://example.com', target: 'http://example.com/test' }],
            };

            const transformedData = transformData(parsedData, rawData, {
                replaceBaseUrls: false,
            });

            expect(transformedData).toMatchSnapshot();
        });
    });
});
