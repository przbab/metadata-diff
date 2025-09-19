'use strict';

const path = require('path');
const { getConfig, getConfigEnvironment, readFile } = require('./config');

jest.mock('joi', () => ({
    validate: (config) => ({
        value: config,
    }),
}));
jest.mock('./schema', () => ({ schema: {} }));

describe('config', () => {
    describe('getConfig', () => {
        test(`should skip config`, () => {
            const testConfig = { test: true };
            const config = getConfig(testConfig, true);

            expect(config).toEqual(testConfig);
        });
        test(`should throw error on missing file`, () => {
            expect(() => {
                getConfig({}, false, './nonExistingFile.json');
            }).toThrow();
        });
    });
    describe('getConfigEnvironment', () => {
        test(`should pass config unchanged`, () => {
            const testConfig = { test: true };
            const config = getConfigEnvironment(testConfig);

            expect(config).toEqual(testConfig);
        });
        test(`should merge with override`, () => {
            const testConfig = { test: true, test3: true };
            const overrideConfig = { test: { betterTest: true }, test2: true };
            const config = getConfigEnvironment(testConfig, overrideConfig);

            expect(config).toEqual({ test: { betterTest: true }, test2: true, test3: true });
        });
        test(`should merge with envoronment`, () => {
            const testConfig = { test: true, test3: true, environment: { test: { test4: true } } };
            const config = getConfigEnvironment(testConfig);

            expect(config).toEqual({ test: true, test3: true, test4: true });
        });

        test(`should merge with envoronment and override`, () => {
            const testConfig = { test: true, test3: true, environment: { test: { test4: true } } };
            const overrideConfig = { test: { betterTest: true }, test2: true };
            const config = getConfigEnvironment(testConfig, overrideConfig);

            expect(config).toEqual({ test: { betterTest: true }, test2: true, test3: true, test4: true });
        });
    });
    describe('readFile', () => {
        test(`should read js file`, () => {
            const configFile = '../../test/mockConfigFiles/config.js';
            const config = readFile(configFile);

            expect(config).toEqual({ test: true });
        });
        test(`should read json file`, () => {
            const configFile = path.join(__dirname, '../../test/mockConfigFiles/config.json');
            const config = readFile(configFile);

            expect(config).toEqual({ test: true });
        });
        test(`should read package.json file`, () => {
            const configFile = path.join(__dirname, '../../test/mockConfigFiles/package.json');
            const config = readFile(configFile);

            expect(config).toEqual({ test: true });
        });
    });
});
