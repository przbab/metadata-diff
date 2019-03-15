'use strict';

let globalSource;
let globalPathname;
const metadataDiffNode = document.getElementById('metadata-diff');
const microdataDiffNode = document.getElementById('microdata-diff');
const jsonLdDiffNode = document.getElementById('json-ld-diff');
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
    const target = event.target.closest('li.environment');
    globalSource = target.id;
    target.classList.add('active');
    metadataDiffNode.setAttribute('source', globalSource);
    microdataDiffNode.setAttribute('source', globalSource);
    jsonLdDiffNode.setAttribute('source', globalSource);
    redirectsNode.setAttribute('source', globalSource);
    render();
}

function showSite(event) {
    document.querySelectorAll('.site-list-item.active').forEach(siteElement => {
        siteElement.classList.remove('active');
    });

    const target = event.target.closest('li.site-list-item');
    globalPathname = target.getAttribute('name');
    target.classList.add('active');

    metadataDiffNode.setAttribute('pathname', globalPathname);
    microdataDiffNode.setAttribute('pathname', globalPathname);
    jsonLdDiffNode.setAttribute('pathname', globalPathname);
    redirectsNode.setAttribute('pathname', globalPathname);

    renderPercent();
    render();
}

function renderPercent() {
    const data = window.DIFF_DATA.diffs.find(site => site.pathname === globalPathname);

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

    serverPercentNode.setAttribute('progress', Math.round(100 * serverPercent));
    clientPercentNode.setAttribute('progress', Math.round(100 * clientPercent));
    candidatePercentNode.setAttribute('progress', Math.round(100 * candidatePercent));
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

function render() {
    if (globalSource && globalPathname) {
        currentUrlNode.setAttribute('href', currentBaseUrl + globalPathname);
        candidateUrlNode.setAttribute('href', candidateBaseUrl + globalPathname);
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

class ProgressRing extends HTMLElement {
    constructor() {
        super();
        const stroke = this.getAttribute('stroke');
        const radius = this.getAttribute('radius');
        const normalizedRadius = radius - stroke * 2;
        this.circumference = normalizedRadius * 2 * Math.PI;

        this.root = this.attachShadow({ mode: 'open' });
        this.root.innerHTML = `
<div>
    <div>
        <span></span>
    </div>
    <svg
        height="${radius * 2}"
        width="${radius * 2}"
    >
        <circle
            stroke="#EEEEEE"
            stroke-width="${stroke}"
            fill="transparent"
            r="${normalizedRadius}"
            cx="${radius}"
            cy="${radius}"
        />
        <circle
            stroke="#ee6e73"
            stroke-dasharray="${this.circumference} ${this.circumference}"
            style="stroke-dashoffset:${this.circumference}"
            stroke-width="${stroke}"
            fill="transparent"
            r="${normalizedRadius}"
            cx="${radius}"
            cy="${radius}"
        />
    </svg>
</div>

<style>
    div {
        position: relative;
        width: ${radius * 2}px;
        height: ${radius * 2}px;
    }
    div > div {
        position: absolute;
        text-align: center;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    circle {
        transition: stroke-dashoffset 0.35s;
        transform: rotate(-90deg);
        transform-origin: 50% 50%;
    }
</style>`;
    }

    setProgress(percent) {
        const offset = this.circumference - (percent / 100) * this.circumference;
        const circle = this.root.querySelector('circle + circle');
        const span = this.root.querySelector('span');
        circle.style.strokeDashoffset = offset;
        span.innerText = `${percent}%`;
    }

    static get observedAttributes() {
        return ['progress'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'progress') {
            this.setProgress(newValue);
        }
    }
}

class Diff extends HTMLElement {
    constructor() {
        super();
        const title = this.getAttribute('title');

        this.root = this.attachShadow({ mode: 'open' });
        this.root.innerHTML = `
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/jsondiffpatch@0.3.11/dist/formatters-styles/html.css" type="text/css" />
<h2>${title}</h2>
<div class="autoscroll"></div>
<style>
.autoscroll {
    overflow-x: auto;
}
</style>`;
    }

    renderData() {
        const pathname = this.getAttribute('pathname');
        const source = this.getAttribute('source');
        const property = this.getAttribute('property');

        if (pathname !== null && source !== null) {
            const data = window.DIFF_DATA.diffs.find(site => site.pathname === pathname)[source];

            const html = jsondiffpatch.formatters.html.format(data[property].delta, data[property].left);

            const content = this.root.querySelector('div');
            content.innerHTML = html;
        }
    }

    static get observedAttributes() {
        return ['pathname', 'source'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if ((name === 'pathname' || name === 'source') && oldValue !== newValue) {
            this.renderData(newValue);
        }
    }
}

window.customElements.define('progress-ring', ProgressRing);
window.customElements.define('data-diff', Diff);
