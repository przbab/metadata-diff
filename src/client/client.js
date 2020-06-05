'use strict';

const puppeteer = require('puppeteer');
const { getLogger } = require('../logger');

let browserInstance;

async function getBrowser(options) {
    if (browserInstance) {
        return browserInstance;
    }
    browserInstance = await puppeteer.launch({
        headless: options.headless,
        slowMo: options.slowMo,
    });
    attachCleanupHandlers();

    return browserInstance;
}

async function preparePage(options = {}) {
    const browser = await getBrowser(options);
    const page = await browser.newPage();
    if (options.userAgent) {
        page.setUserAgent(options.userAgent);
    }
    if (options.blockRequests && options.blockRequests.length > 0) {
        await blockRequests(page, options.blockRequests);
    }

    return page;
}

async function blockRequests(page, urls) {
    const blockedRequests = new RegExp(`(${urls.join('|')})`, 'i');

    await page.setRequestInterception(true);
    page.on('request', (interceptedRequest) => {
        const url = interceptedRequest.url();

        if (blockedRequests.test(url)) {
            interceptedRequest.abort();
        } else {
            interceptedRequest.continue();
        }
    });
}

async function fetchClient(url, options) {
    const page = await preparePage(options);
    const response = await page.goto(url, options.goto);
    const redirects = response
        .request()
        .redirectChain()
        .map((request) => {
            const chainedResponse = request.response();
            return {
                status: chainedResponse.status(),
                target: chainedResponse.headers().location,
                url: request.url(),
            };
        });
    if (options.additionalWait) {
        await page.waitFor(options.additionalWait);
    }
    const html = await page.content();
    await page.close();

    return { html, redirects };
}

function attachCleanupHandlers() {
    // do something when app is closing
    process.on('exit', exitHandler);

    // catches ctrl+c event
    process.on('SIGINT', exitHandler);

    // catches "kill pid" (for example: nodemon restart)
    process.on('SIGUSR1', exitHandler);
    process.on('SIGUSR2', exitHandler);

    // catches uncaught exceptions
    process.on('uncaughtException', exitHandler);
}

async function exitHandler(code) {
    getLogger().verbose('Closing chrome...');
    await browserInstance.close();
    process.exit(code);
}

module.exports = { fetchClient };
