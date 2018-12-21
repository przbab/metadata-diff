'use strict';

const puppeteer = require('puppeteer');

let browserInstance;

async function getBrowser() {
    if (browserInstance) {
        return browserInstance;
    }
    browserInstance = await puppeteer.launch();
    attachCleanupHandlers();

    return browserInstance;
}

async function preparePage(options = {}) {
    const browser = await getBrowser();
    const page = await browser.newPage();
    if (options.userAgent) {
        page.setUserAgent(options.userAgent);
    }

    return page;
}

async function getHTML(url, options) {
    const page = await preparePage(options);
    await page.goto(url);
    await page.waitFor(200);
    const HTML = await page.content();
    await page.close();

    return HTML;
}

function attachCleanupHandlers() {
    // so the program will not close instantly
    // process.stdin.resume();

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
    console.info('Closing chrome...');
    await browserInstance.close();
    process.exit(code);
}

module.exports = getHTML;
