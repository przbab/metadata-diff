'use strict';

const { prepareUrls } = require('./prepareUrls');

describe('urls', () => {
    describe('prepareUrls', () => {
        test(`base urls replacement with same urls`, () => {
            const config = {
                replaceBaseUrls: true,
                currentBaseUrl: 'https://www.example.com',
                candidateBaseUrl: 'http://www.example.com',
            };

            const input = 'http://www.example.com/something';

            expect(prepareUrls(input, config)).toEqual('base-url/something');
        });
        test(`base urls replacement without www`, () => {
            const config = {
                replaceBaseUrls: true,
                currentBaseUrl: 'https://example.com',
                candidateBaseUrl: 'http://www.different-website.com',
            };

            const input = 'http://www.example.com/something';

            expect(prepareUrls(input, config)).toEqual('base-url/something');
        });
        test(`base urls replacement without protocol in base url`, () => {
            const config = {
                replaceBaseUrls: true,
                currentBaseUrl: 'www.example.com',
                candidateBaseUrl: 'http://www.different-website.com',
            };

            const input = 'http://www.example.com/something';

            expect(prepareUrls(input, config)).toEqual('base-url/something');
        });
        test(`base urls replacement without www and protocol in base url`, () => {
            const config = {
                replaceBaseUrls: true,
                currentBaseUrl: 'example.com',
                candidateBaseUrl: 'http://www.different-website.com',
            };

            const input = 'http://www.example.com/something';

            expect(prepareUrls(input, config)).toEqual('base-url/something');
        });
        test(`base urls replacement without www`, () => {
            const config = {
                replaceBaseUrls: true,
                currentBaseUrl: 'https://www.example.com',
                candidateBaseUrl: 'http://www.different-website.com',
            };

            const input = 'http://example.com/something';

            expect(prepareUrls(input, config)).toEqual('base-url/something');
        });
        test(`base urls replacement without protocol in url`, () => {
            const config = {
                replaceBaseUrls: true,
                currentBaseUrl: 'http://www.example.com',
                candidateBaseUrl: 'http://www.different-website.com',
            };

            const input = 'www.example.com/something';

            expect(prepareUrls(input, config)).toEqual('base-url/something');
        });
        test(`base urls replacement without www and protocol in url`, () => {
            const config = {
                replaceBaseUrls: true,
                currentBaseUrl: 'http://www.example.com',
                candidateBaseUrl: 'http://www.different-website.com',
            };

            const input = 'example.com/something';

            expect(prepareUrls(input, config)).toEqual('base-url/something');
        });
        test(`replacements`, () => {
            const config = {
                replaceBaseUrls: false,
                replacements: [
                    {
                        regExp: '(https?://)?(www.)?example.com',
                        flags: 'i',
                        replace: 'test',
                    },
                ],
            };

            const input = 'Example.com/something';

            expect(prepareUrls(input, config)).toEqual('test/something');
        });
    });
});
