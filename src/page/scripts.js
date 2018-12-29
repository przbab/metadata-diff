'use strict';

const jsondiff = jsondiffpatch.create({});
let source;
let pathname;
const metadataDiffNode = document.getElementById('metadata-diff');
const microdataDiffNode = document.getElementById('microdata-diff');

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
    pathname = event.target.textContent;
    event.target.classList.add('active');
    render();
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
    const data = window.DIFF_DATA.diffs.find(site => site.pathname === pathname)[source];
    if (source === 'candidate') {
        return [data.server, data.client];
    }
    return [data.current, data.candidate];
}

function render() {
    if (source && pathname) {
        const [left, right] = getData();

        const { microdata: leftMicrodata, ...leftReducedMetadata } = left;
        const { microdata: rightMicrodata, ...rightReducedMetadata } = right;

        const metadataDelta = jsondiff.diff(leftReducedMetadata, rightReducedMetadata) || {};
        metadataDiffNode.innerHTML = jsondiffpatch.formatters.html.format(metadataDelta, leftReducedMetadata);

        const [leftMatchedMicrodata, rightMatchedMicrodata] = matchMicrodataItems(leftMicrodata, rightMicrodata);

        const microdataDelta = jsondiff.diff(leftMatchedMicrodata, rightMatchedMicrodata) || {};
        microdataDiffNode.innerHTML = jsondiffpatch.formatters.html.format(microdataDelta, leftMatchedMicrodata);
    }
}

function matchMicrodataItems(leftMicrodata, rightMicrodata) {
    const left = {};
    const right = {};
    leftMicrodata.items.forEach(item => {
        const type = (item.type && item.type[0]) || 'Unspecified Type';
        if (!left[type]) {
            left[type] = [];
        }
        left[type].push(item.properties);
    });
    rightMicrodata.items.forEach(item => {
        const type = (item.type && item.type[0]) || 'Unspecified Type';
        if (!right[type]) {
            right[type] = [];
        }
        right[type].push(item.properties);
    });

    return [left, right];
}

document.addEventListener('DOMContentLoaded', () => {
    changeSource({ target: document.getElementById('server') });
    showSite({ target: document.getElementsByClassName('site-list-item')[0] });
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
