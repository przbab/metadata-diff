'use strict';

let source;
let pathname;
const metadataDiffNode = document.getElementById('metadata-diff');
const microdataDiffNode = document.getElementById('microdata-diff');
const redirectsNode = document.getElementById('redirects');
const currentUrlNode = document.getElementById('current-url');
const candidateUrlNode = document.getElementById('candidate-url');
const serverPercentNode = document.getElementById('server-percent');
const clientPercentNode = document.getElementById('client-percent');
const candidatePercentNode = document.getElementById('candidate-percent');
const currentBaseUrl = window.DIFF_DATA.currentBaseUrl;
const candidateBaseUrl = window.DIFF_DATA.candidateBaseUrl;

function changeSource(event) {
    document.querySelectorAll('.environment.active').forEach(siteElement => {
        siteElement.classList.remove('active');
    });
    source = event.target.id;
    event.target.classList.add('active');
    render();
}

function showSite(event) {
    document.querySelectorAll('.site-list-item.active').forEach(siteElement => {
        siteElement.classList.remove('active');
    });
    pathname = event.target.getAttribute('name');
    event.target.classList.add('active');

    renderPercent();
    render();
}

function renderPercent() {
    const data = window.DIFF_DATA.diffs.find(site => site.pathname === pathname);

    const { candidate, client, server } = ['candidate', 'client', 'server'].reduce((acc, type) => {
        const internalCount = ['metadata', 'microdata', 'redirects'].reduce(
            (acc2, dataType) => ({
                all: acc2.all + data[type][dataType].all,
                differences: acc2.differences + data[type][dataType].differences,
            }),
            { all: 0, differences: 0 }
        );
        return {
            ...acc,
            [type]: internalCount,
        };
    }, {});

    const serverPercent = server.differences / server.all;
    const clientPercent = client.differences / client.all;
    const candidatePercent = candidate.differences / candidate.all;

    serverPercentNode.innerHTML = `${Math.round(100 * serverPercent)}%`;
    clientPercentNode.innerHTML = `${Math.round(100 * clientPercent)}%`;
    candidatePercentNode.innerHTML = `${Math.round(100 * candidatePercent)}%`;
}

function nextSource() {
    const activeSource = document.querySelector('.environment.active');
    const nextSibling = activeSource.nextElementSibling;
    if (nextSibling) {
        changeSource({ target: nextSibling });
    }
}

function previousSource() {
    const activeSource = document.querySelector('.environment.active');
    const previousSibling = activeSource.previousElementSibling;
    if (previousSibling) {
        changeSource({ target: previousSibling });
    }
}

function nextSite() {
    const activeSite = document.querySelector('.site-list-item.active');
    const nextSibling = activeSite.nextElementSibling;
    if (nextSibling) {
        showSite({ target: nextSibling });
    }
}

function previousSite() {
    const activeSite = document.querySelector('.site-list-item.active');
    const previousSibling = activeSite.previousElementSibling;
    if (previousSibling) {
        showSite({ target: previousSibling });
    }
}

function getData() {
    return window.DIFF_DATA.diffs.find(site => site.pathname === pathname)[source];
}

function render() {
    if (source && pathname) {
        const data = getData();

        metadataDiffNode.innerHTML = jsondiffpatch.formatters.html.format(data.metadata.delta, data.metadata.left);
        microdataDiffNode.innerHTML = jsondiffpatch.formatters.html.format(data.microdata.delta, data.microdata.left);
        redirectsNode.innerHTML = jsondiffpatch.formatters.html.format(data.redirects.delta, data.redirects.left);

        currentUrlNode.setAttribute('href', currentBaseUrl + pathname);
        candidateUrlNode.setAttribute('href', candidateBaseUrl + pathname);
    }
}

function handleUnchangedSwitch(event) {
    if (event.target.checked) {
        jsondiffpatch.formatters.html.showUnchanged();
    } else {
        jsondiffpatch.formatters.html.hideUnchanged();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    changeSource({ target: document.getElementById('server') });
    showSite({ target: document.getElementsByClassName('site-list-item')[0] });
    document.getElementById('show-unchanged').addEventListener('click', handleUnchangedSwitch);
    window.addEventListener('keydown', e => {
        if (e.metaKey) {
            switch (e.keyCode) {
                case 37:
                    e.preventDefault();
                    previousSource();
                    break;
                case 38:
                    e.preventDefault();
                    previousSite();
                    break;
                case 39:
                    e.preventDefault();
                    nextSource();
                    break;
                case 40:
                    e.preventDefault();
                    nextSite();
                    break;
                default:
                    break;
            }
        }
    });
});
